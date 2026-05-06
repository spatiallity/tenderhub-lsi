import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_KEYWORDS, DEFAULT_USERS, PROVINCES } from '../utils/constants';
import { calcRupMatch, enrichTender, activeKeywordCount } from '../utils/helpers';
import { FALLBACK_RUP } from '../data/rupDummy';
import { FALLBACK_TENDERS, FALLBACK_EXPERTS } from '../data/demoData';
import { useToast } from '../components/UI/Toast';

const AppContext = createContext();

const readStoredIds = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const writeStoredIds = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Keep the in-memory state even when localStorage is unavailable.
  }
};

const isInitialAnnouncementTender = (tender) => {
  const stageName = (tender.currentStageName || '').toLowerCase();
  return tender.currentStage === 1 && stageName.includes('pengumuman');
};

export const AppProvider = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toast = useToast();

  // Keywords state - will be loaded from Supabase
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);
  const [loadingKeywords, setLoadingKeywords] = useState(true);

  // Tenders state from API
  const [tendersRaw, setTendersRaw] = useState([]);
  const [rupRaw, setRupRaw] = useState([]);
  const [expertsRaw, setExpertsRaw] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(true);
  const [loadingRup, setLoadingRup] = useState(true);
  const [loadingExperts, setLoadingExperts] = useState(true);

  // Internal state (like mockup)
  const [internalStatuses, setInternalStatuses] = useState({});
  const [tenderNotes, setTenderNotes] = useState({});
  const [noteSaved, setNoteSaved] = useState({});
  const [assignedPICs, setAssignedPICs] = useState({});
  const [expertCVs, setExpertCVs] = useState({});
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [notifications, setNotifications] = useState({ baru: true, deadline: true, status: true, ta: true });
  const [coverage, setCoverage] = useState(() => PROVINCES.map((name, i) => ({ name, active: i < 10 })));
  const [hpsThreshold, setHpsThreshold] = useState(200);

  // Panel state
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [selectedRupId, setSelectedRupId] = useState(null);
  const [openedTenderIds, setOpenedTenderIds] = useState(() => readStoredIds('lsi-opened-tender-ids'));
  const [openedRupIds, setOpenedRupIds] = useState(() => readStoredIds('lsi-opened-rup-ids'));
  const [showWinrateDetail, setShowWinrateDetail] = useState(false);
  const [showStageRef, setShowStageRef] = useState(false);
  const [showPotensiChart, setShowPotensiChart] = useState(false);
  const [showUrgentPanel, setShowUrgentPanel] = useState(false);
  const [showKeywordManager, setShowKeywordManager] = useState(false);
  const [dashboardChartFilter, setDashboardChartFilter] = useState({ mode: 'all', portfolio: null });

  // Review & history draft
  const [reviewDraft, setReviewDraft] = useState({ reviewer: '', rating: 5, komentar: '' });
  const [historyDraft, setHistoryDraft] = useState({ proyek: '', klien: '', tahun: '', nilai: '', peran: '', bersama: 'Sucofindo' });

  // Toast helper function
  const showToast = useCallback((msg, type = 'success') => {
    const toastConfig = {
      success: () => toast.success('Berhasil', msg),
      error: () => toast.error('Error', msg, { duration: 0 }),
      warning: () => toast.warning('Peringatan', msg),
      info: () => toast.info('Info', msg),
    };
    
    (toastConfig[type] || toastConfig.info)();
  }, [toast]);

  // Load keywords from Supabase
  useEffect(() => {
    const loadKeywords = async () => {
      try {
        console.log('[AppContext] Loading keywords from Supabase...');
        const res = await api.get('/keywords');
        console.log('[AppContext] Keywords loaded:', res.data);
        const keywordsData = res.data || [];
        
        // Transform from flat array to grouped object
        const grouped = { FLP: [], SDA: [], FITI: [] };
        keywordsData.forEach(kw => {
          const portfolio = kw.subporto || 'SDA';
          if (grouped[portfolio]) {
            grouped[portfolio].push({
              id: `${portfolio}-${kw.id}`,
              dbId: kw.id, // Store database ID for updates/deletes
              text: kw.keyword_text,
              active: kw.is_active !== false
            });
          }
        });
        
        console.log('[AppContext] Keywords grouped:', grouped);
        setKeywords(grouped);
      } catch (err) {
        console.error('[AppContext] Failed to load keywords:', err);
        // Keep DEFAULT_KEYWORDS as fallback
      } finally {
        setLoadingKeywords(false);
      }
    };
    
    loadKeywords();
  }, []);

  // Load data from API on mount
  useEffect(() => {
    const loadTendersAndWatchlist = async () => {
      try {
        // Tenders and watchlist are shared across all team members
        const [tendersRes, watchlistRes] = await Promise.all([
          api.get('/tender/search', { params: { limit: 200 } }),
          api.get('/watchlist'),
        ]);

        setTendersRaw(tendersRes.data || []);

        const statusMap = {};
        const picsMap = {};
        const notesMap = {};

        (watchlistRes.data || []).forEach(w => {
          const tenderId = w.kd_tender;
          if (w.status_internal) statusMap[tenderId] = w.status_internal;
          if (w.assigned_pic) picsMap[tenderId] = w.assigned_pic;
          if (w.catatan_internal) {
            try { notesMap[tenderId] = JSON.parse(w.catatan_internal); } catch {}
          }
        });

        // Fill API defaults for tenders not yet in watchlist
        (tendersRes.data || []).forEach(t => {
          if (!statusMap[t.id]) {
            let s = t.internalStatus || 'Dipantau';
            if (t.won === true) s = 'Menang';
            else if (s === 'Sudah Diikuti' && t.lost === true) s = 'Kalah';
            statusMap[t.id] = s;
          }
        });

        setInternalStatuses(statusMap);
        setAssignedPICs(picsMap);
        setTenderNotes(notesMap);

      } catch (err) {
        console.error('Failed to load data:', err);
        setTendersRaw(FALLBACK_TENDERS);
        const statusMap = {};
        FALLBACK_TENDERS.forEach(t => {
          let s = t.internalStatus || 'Dipantau';
          if (t.won === true) s = 'Menang';
          else if (s === 'Sudah Diikuti' && t.lost === true) s = 'Kalah';
          statusMap[t.id] = s;
        });
        setInternalStatuses(statusMap);
        showToast('API tender belum tersambung. Dummy tender lokal dimuat.', 'error');
      } finally {
        setLoadingTenders(false);
      }
    };

    loadTendersAndWatchlist();
  }, [showToast]);

  useEffect(() => {
    api.get('/rup/search', { params: { limit: 100 } })
      .then(res => setRupRaw(res.data || []))
      .catch(() => {
        setRupRaw(FALLBACK_RUP);
        showToast('API RUP belum tersambung. Dummy RUP lokal dimuat.', 'error');
      })
      .finally(() => setLoadingRup(false));
  }, []); // Removed showToast - run only once

  useEffect(() => {
    api.get('/experts')
      .then(res => setExpertsRaw(res.data || []))
      .catch(() => {
        setExpertsRaw(FALLBACK_EXPERTS);
        showToast('API expert belum tersambung. Dummy tenaga ahli lokal dimuat.', 'error');
      })
      .finally(() => setLoadingExperts(false));
  }, []); // Removed showToast - run only once

  // Phase 1: Heavy enrichment (relevance, stages, deadlines) — only re-runs when raw data or keywords change
  const tendersEnriched = useMemo(() =>
    tendersRaw.map(t => enrichTender(t, keywords, {})),
    [tendersRaw, keywords]
  );

  // Phase 2: Cheap status overlay — only re-runs when internalStatuses change (lightweight merge)
  const tenders = useMemo(() =>
    tendersEnriched.map(t => {
      const status = (internalStatuses[t.id] || t.internalStatus || 'Dipantau').trim();
      return status !== t.internalStatus ? { ...t, internalStatus: status } : t;
    }),
    [tendersEnriched, internalStatuses]
  );

  // Enriched RUP
  const rupPlans = useMemo(() =>
    rupRaw.map(r => ({ ...r, ...calcRupMatch(r, keywords) })),
    [rupRaw, keywords]
  );

  // Derived counts
  const keywordCount = useMemo(() => activeKeywordCount(keywords), [keywords]);
  const totalPotensi = useMemo(() => tenders.reduce((sum, t) => sum + (t.hps || 0), 0), [tenders]);
  const relevantCount = useMemo(() =>
    keywordCount ? tenders.filter(t => t.matched?.length > 0).length : tenders.length,
    [tenders, keywordCount]
  );
  const urgentCount = useMemo(() =>
    tenders.filter(t => t.daysLeft <= 7 && t.daysLeft >= 0).length,
    [tenders]
  );

  // Selected items
  const selectedTender = useMemo(() => tenders.find(t => t.id === selectedTenderId), [tenders, selectedTenderId]);
  const selectedExpert = useMemo(() => expertsRaw.find(e => e.id === selectedExpertId), [expertsRaw, selectedExpertId]);
  const selectedRup = useMemo(() => rupPlans.find(r => r.id === selectedRupId), [rupPlans, selectedRupId]);

  const openedTenderSet = useMemo(() => new Set(openedTenderIds.map(String)), [openedTenderIds]);
  const openedRupSet = useMemo(() => new Set(openedRupIds.map(String)), [openedRupIds]);
  const newTenderIds = useMemo(() =>
    tenders
      .filter(t => isInitialAnnouncementTender(t))
      .map(t => t.id)
      .filter(id => !openedTenderSet.has(String(id))),
    [tenders, openedTenderSet]
  );
  const newRupIds = useMemo(() => rupPlans.map(r => r.id).filter(id => !openedRupSet.has(String(id))), [rupPlans, openedRupSet]);

  const markTenderOpened = useCallback((id) => {
    if (id == null) return;
    setOpenedTenderIds(prev => {
      if (prev.map(String).includes(String(id))) return prev;
      const next = [...prev, id];
      writeStoredIds('lsi-opened-tender-ids', next);
      return next;
    });
  }, []);

  const markRupOpened = useCallback((id) => {
    if (id == null) return;
    setOpenedRupIds(prev => {
      if (prev.map(String).includes(String(id))) return prev;
      const next = [...prev, id];
      writeStoredIds('lsi-opened-rup-ids', next);
      return next;
    });
  }, []);

  const openTender = useCallback((id) => {
    markTenderOpened(id);
    setSelectedTenderId(id);
  }, [markTenderOpened]);

  const openRup = useCallback((id) => {
    markRupOpened(id);
    setSelectedRupId(id);
  }, [markRupOpened]);

  // Keyword actions
  const addKeyword = useCallback(async (portfolio, text) => {
    if (!text?.trim()) return;
    
    // Optimistic update
    const tempId = `${portfolio}-${Date.now()}`;
    setKeywords(prev => ({
      ...prev,
      [portfolio]: [...prev[portfolio], { id: tempId, text: text.trim(), active: true }]
    }));
    
    // Sync to database
    try {
      const res = await api.post('/keywords', {
        keyword_text: text.trim(),
        subporto: portfolio,
        is_active: true
      });
      
      // Update with real database ID
      setKeywords(prev => ({
        ...prev,
        [portfolio]: prev[portfolio].map(k => 
          k.id === tempId ? { ...k, id: `${portfolio}-${res.data.id}`, dbId: res.data.id } : k
        )
      }));
    } catch (err) {
      console.error('Failed to save keyword:', err);
      showToast('Keyword disimpan lokal (belum tersinkron ke database)', 'warning');
    }
  }, [showToast]);

  const removeKeyword = useCallback(async (portfolio, id) => {
    // Optimistic update
    setKeywords(prev => ({ ...prev, [portfolio]: prev[portfolio].filter(k => k.id !== id) }));
    
    // Sync to database
    const keyword = keywords[portfolio]?.find(k => k.id === id);
    if (keyword?.dbId) {
      try {
        await api.delete(`/keywords/${keyword.dbId}`);
      } catch (err) {
        console.error('Failed to delete keyword from database:', err);
      }
    }
  }, [keywords]);

  const clearKeywords = useCallback(async () => {
    // Get all keyword IDs to delete
    const allKeywords = Object.values(keywords).flat();
    
    // Optimistic update
    setKeywords(prev => Object.fromEntries(Object.keys(prev).map(portfolio => [portfolio, []])));
    showToast('Semua keyword berhasil dibersihkan');
    
    // Sync to database
    try {
      await Promise.all(
        allKeywords
          .filter(k => k.dbId)
          .map(k => api.delete(`/keywords/${k.dbId}`).catch(err => console.error('Failed to delete keyword:', err)))
      );
    } catch (err) {
      console.error('Failed to clear keywords from database:', err);
    }
  }, [keywords, showToast]);

  const updateKeyword = useCallback(async (portfolio, id, patch) => {
    // Optimistic update
    setKeywords(prev => ({
      ...prev,
      [portfolio]: prev[portfolio].map(k => k.id === id ? { ...k, ...patch } : k)
    }));
    
    // Sync to database
    const keyword = keywords[portfolio]?.find(k => k.id === id);
    if (keyword?.dbId) {
      try {
        await api.put(`/keywords/${keyword.dbId}`, {
          keyword_text: patch.text || keyword.text,
          subporto: portfolio,
          is_active: patch.active !== undefined ? patch.active : keyword.active
        });
      } catch (err) {
        console.error('Failed to update keyword in database:', err);
      }
    }
  }, [keywords]);

  // Expert actions
  const addExpert = useCallback(async (draft) => {
    if (!draft.nama?.trim() || !draft.keahlian?.trim()) {
      showToast('Nama dan keahlian wajib diisi', 'warning');
      return false;
    }
    
    const body = {
      nama: draft.nama.trim(),
      instansi: draft.instansi?.trim() || 'Eksternal SUCOFINDO',
      keahlian: [draft.keahlian.trim()],
      availability: draft.availability || 'Tersedia',
      portofolio: [draft.portfolio || 'SDA'],
      rating: 4.2,
      proyek: 0,
    };
    
    try {
      const res = await api.post('/experts', body);
      setExpertsRaw(prev => [...prev, res.data]);
      showToast('Tenaga ahli berhasil ditambahkan');
      return true; // ✅ Return success
    } catch (e) {
      console.error('[addExpert] Failed to add expert:', e);
      const fallbackExpert = { ...body, id: Date.now(), noHp: draft.noHp || '', history: [], reviews: [] };
      setExpertsRaw(prev => [...prev, fallbackExpert]);
      showToast('API expert belum tersambung. Data expert disimpan sementara di browser.', 'error');
      return false; // ❌ Return failure
    }
  }, [showToast]);

  const updateExpertName = useCallback((expertId, nama) => {
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? { ...e, nama } : e));
  }, [showToast]);

  const updateExpertProfile = useCallback(async (expertId, patch) => {
    const safePatch = {
      nama: patch?.nama?.trim(),
      noHp: patch?.noHp?.trim(),
      instansi: patch?.instansi?.trim(),
    };
    try {
      await api.patch(`/experts/${expertId}`, safePatch);
    } catch {
      // Keep local fallback update when API is unavailable.
    }
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? { ...e, ...safePatch } : e));
    showToast('Profil tenaga ahli berhasil diperbarui');
  }, [showToast]);

  const deleteExpert = useCallback(async (expertId) => {
    try {
      await api.delete(`/experts/${expertId}`);
      setExpertsRaw(prev => prev.filter(e => e.id !== expertId));
      setSelectedExpertId(prev => prev === expertId ? null : prev);
      showToast('Tenaga ahli dihapus');
    } catch {
      setExpertsRaw(prev => prev.filter(e => e.id !== expertId));
      setSelectedExpertId(prev => prev === expertId ? null : prev);
    }
  }, []);

  const addReview = useCallback((expertId) => {
    if (!reviewDraft.reviewer.trim() || !reviewDraft.komentar.trim()) return;
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? {
      ...e,
      reviews: [...(e.reviews || []), { ...reviewDraft, tanggal: new Date().toLocaleDateString('id-ID') }],
      rating: Number(((e.rating * (e.reviews || []).length + reviewDraft.rating) / ((e.reviews || []).length + 1)).toFixed(1))
    } : e));
    setReviewDraft({ reviewer: '', rating: 5, komentar: '' });
    showToast('Review berhasil disimpan');
  }, [reviewDraft]);

  const addHistory = useCallback((expertId) => {
    if (!historyDraft.proyek.trim() || !historyDraft.klien.trim()) return;
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? {
      ...e,
      history: [...(e.history || []), {
        proyek: historyDraft.proyek,
        klien: historyDraft.klien,
        tahun: historyDraft.tahun || new Date().getFullYear(),
        nilai: Number(historyDraft.nilai || 0) * 1000000,
        peran: historyDraft.peran || 'Tenaga Ahli',
        bersama: historyDraft.bersama,
        status: 'Selesai'
      }],
      proyek: (e.proyek || 0) + 1
    } : e));
    setHistoryDraft({ proyek: '', klien: '', tahun: '', nilai: '', peran: '', bersama: 'Sucofindo' });
    showToast('Riwayat berhasil disimpan');
  }, [historyDraft]);

  const addUser = useCallback((draft) => {
    if (!draft?.nama?.trim()) return;
    const newUser = {
      id: Date.now(),
      nama: draft.nama.trim(),
      role: draft.role || 'PIC',
      aktif: draft.aktif ?? true,
    };
    setUsers(prev => [...prev, newUser]);
    showToast('Pengguna baru berhasil ditambahkan');
  }, [showToast]);

  const updateUser = useCallback((userId, patch) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...patch } : u));
    showToast('Data pengguna berhasil diperbarui');
  }, [showToast]);

  const deleteUser = useCallback((userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('Pengguna berhasil dihapus');
  }, [showToast]);

  const refetchTenders = useCallback(async () => {
    try {
      const [tendersRes, watchlistRes] = await Promise.all([
        api.get('/tender/search', { params: { limit: 200 } }),
        api.get('/watchlist'),
      ]);

      setTendersRaw(tendersRes.data || []);

      const statusMap = {};
      const picsMap = {};
      const notesMap = {};

      (watchlistRes.data || []).forEach(w => {
        if (w.status_internal) statusMap[w.kd_tender] = w.status_internal;
        if (w.assigned_pic) picsMap[w.kd_tender] = w.assigned_pic;
        if (w.catatan_internal) {
          try { notesMap[w.kd_tender] = JSON.parse(w.catatan_internal); } catch {}
        }
      });

      (tendersRes.data || []).forEach(t => {
        if (!statusMap[t.id]) {
          let s = t.internalStatus || 'Dipantau';
          if (t.won === true) s = 'Menang';
          else if (s === 'Sudah Diikuti' && t.lost === true) s = 'Kalah';
          statusMap[t.id] = s;
        }
      });

      setInternalStatuses(statusMap);
      setAssignedPICs(picsMap);
      setTenderNotes(notesMap);
    } catch (err) {
      console.error('Failed to refetch tenders:', err);
    }
  }, []);

  // Helper: ensure a watchlist entry exists for kd_tender (create if not found)
  const ensureWatchlistEntry = useCallback(async (tenderId, forcedStatus) => {
    const tender = tenders.find(t => t.id === tenderId);
    await api.post('/watchlist', {
      kd_tender: parseInt(tenderId),
      status_internal: forcedStatus !== undefined ? forcedStatus : (internalStatuses[tenderId] || 'Dipantau'),
      nama_paket: tender?.nama || tender?.nama_paket || null,
      hps: tender?.hps || null,
    });
  }, [tenders, internalStatuses]);

  const updateTenderStatus = useCallback(async (tenderId, newStatus) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menyimpan perubahan', 'warning');
      return;
    }

    // Enforce: "Menang" only allowed after winner announcement stage
    if (newStatus === 'Menang') {
      const tender = tenders.find(t => t.id === tenderId);
      const stageName = (tender?.currentStageName || '').toLowerCase();
      const canBeWon =
        stageName.includes('pemenang') ||
        stageName.includes('sanggah') ||
        stageName.includes('klarifikasi') ||
        stageName.includes('penunjukan') ||
        stageName.includes('kontrak') ||
        (stageName.includes('pengumuman') && (tender?.currentStage || 0) > 1);

      if (!canBeWon) {
        showToast('Status "Menang" hanya bisa diset setelah tahap Pengumuman Pemenang', 'warning');
        return;
      }
    }

    window.dispatchEvent(new CustomEvent('tender-local-update', { detail: { tenderId } }));
    setInternalStatuses(prev => ({ ...prev, [tenderId]: newStatus }));

    try {
      await api.patch(`/watchlist/${tenderId}`, { status_internal: newStatus });
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await ensureWatchlistEntry(tenderId, newStatus);
          await api.patch(`/watchlist/${tenderId}`, { status_internal: newStatus });
        } catch {
          throw new Error('sync_failed');
        }
      } else {
        throw new Error('sync_failed');
      }
    }
  }, [user, isGuest, tenders, ensureWatchlistEntry, showToast]);

  const updateTenderPIC = useCallback(async (tenderId, userId) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menyimpan perubahan', 'warning');
      return;
    }

    window.dispatchEvent(new CustomEvent('tender-local-update', { detail: { tenderId } }));
    setAssignedPICs(prev => ({ ...prev, [tenderId]: userId }));

    try {
      await api.patch(`/watchlist/${tenderId}`, { assigned_pic: userId || null });
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await ensureWatchlistEntry(tenderId);
          await api.patch(`/watchlist/${tenderId}`, { assigned_pic: userId || null });
        } catch {
          throw new Error('sync_failed');
        }
      } else {
        throw new Error('sync_failed');
      }
    }
  }, [user, isGuest, ensureWatchlistEntry, showToast]);

  const addTenderNote = useCallback(async (tenderId, noteObj) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menambahkan catatan', 'warning');
      return;
    }

    window.dispatchEvent(new CustomEvent('tender-local-update', { detail: { tenderId } }));
    const updatedNotes = [...(tenderNotes[tenderId] || []), noteObj];
    setTenderNotes(prev => ({ ...prev, [tenderId]: updatedNotes }));

    const payload = { catatan_internal: JSON.stringify(updatedNotes) };
    try {
      await api.patch(`/watchlist/${tenderId}`, payload);
    } catch (err) {
      if (err?.response?.status === 404) {
        try {
          await ensureWatchlistEntry(tenderId);
          await api.patch(`/watchlist/${tenderId}`, payload);
        } catch {
          throw new Error('sync_failed');
        }
      } else {
        throw new Error('sync_failed');
      }
    }
  }, [user, isGuest, tenderNotes, ensureWatchlistEntry, showToast]);

  const value = useMemo(() => ({
    // Sidebar
    sidebarCollapsed, setSidebarCollapsed,
    // Toast
    toast,
    showToast,
    toasts: toast.toasts,
    removeToast: toast.removeToast,
    // Data & actions
    tenders, rupPlans, expertsRaw, setExpertsRaw,
    refetchTenders,
    rupList: rupPlans,
    experts: expertsRaw,
    loadingTenders, loadingRup, loadingExperts,
    // Derived
    keywordCount, totalPotensi, relevantCount, urgentCount,
    // Keywords
    keywords, setKeywords, addKeyword, removeKeyword, clearKeywords, updateKeyword,
    // Internal state
    internalStatuses, setInternalStatuses, updateTenderStatus,
    tenderNotes, setTenderNotes, addTenderNote,
    noteSaved, setNoteSaved,
    assignedPICs, setAssignedPICs, updateTenderPIC,
    expertCVs, setExpertCVs,
    users, setUsers,
    addUser, updateUser, deleteUser,
    notifications, setNotifications,
    coverage, setCoverage,
    hpsThreshold, setHpsThreshold,
    // Panel state
    selectedTenderId, setSelectedTenderId: openTender,
    selectedExpertId, setSelectedExpertId,
    selectedRupId, setSelectedRupId: openRup,
    selectedTender, selectedExpert, selectedRup,
    newTenderIds, newRupIds,
    newTenderCount: newTenderIds.length,
    newRupCount: newRupIds.length,
    markTenderOpened, markRupOpened,
    showWinrateDetail, setShowWinrateDetail,
    showStageRef, setShowStageRef,
    showPotensiChart, setShowPotensiChart,
    showUrgentPanel, setShowUrgentPanel,
    showKeywordManager, setShowKeywordManager,
    dashboardChartFilter, setDashboardChartFilter,
    // Expert actions
    addExpert, updateExpertName, updateExpertProfile, deleteExpert,
    reviewDraft, setReviewDraft, addReview,
    historyDraft, setHistoryDraft, addHistory,
  }), [
    sidebarCollapsed, toast, showToast,
    tenders, rupPlans, expertsRaw,
    refetchTenders,
    loadingTenders, loadingRup, loadingExperts,
    keywordCount, totalPotensi, relevantCount, urgentCount,
    keywords, addKeyword, removeKeyword, clearKeywords, updateKeyword,
    internalStatuses, updateTenderStatus, tenderNotes, addTenderNote, noteSaved, assignedPICs, updateTenderPIC, expertCVs,
    users, addUser, updateUser, deleteUser,
    notifications, coverage, hpsThreshold,
    selectedTenderId, selectedExpertId, selectedRupId,
    selectedTender, selectedExpert, selectedRup,
    newTenderIds, newRupIds, openTender, openRup,
    markTenderOpened, markRupOpened,
    showWinrateDetail, showStageRef, showPotensiChart, showUrgentPanel, showKeywordManager,
    dashboardChartFilter,
    addExpert, updateExpertName, updateExpertProfile, deleteExpert,
    reviewDraft, addReview, historyDraft, addHistory,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../services/api';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toast = useToast();
  
  // Track if initial data has been loaded
  const expertsLoadedRef = useRef(false);

  // Keywords state
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);

  // Tenders state from API
  const [tendersRaw, setTendersRaw] = useState([]);
  const [rupRaw, setRupRaw] = useState([]);
  const [expertsRaw, setExpertsRaw] = useState(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem('lsi-experts-local');
      if (stored) {
        console.log('Loading experts from localStorage');
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load experts from localStorage:', err);
    }
    return [];
  });
  const [loadingTenders, setLoadingTenders] = useState(true);
  const [loadingRup, setLoadingRup] = useState(true);
  const [loadingExperts, setLoadingExperts] = useState(true);

  // Internal state (like mockup)
  const [internalStatuses, setInternalStatuses] = useState(() => {
    try {
      const stored = localStorage.getItem('lsi-internal-statuses');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [tenderNotes, setTenderNotes] = useState(() => {
    try {
      const stored = localStorage.getItem('lsi-tender-notes');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [noteSaved, setNoteSaved] = useState({});
  const [assignedPICs, setAssignedPICs] = useState(() => {
    try {
      const stored = localStorage.getItem('lsi-assigned-pics');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
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

  // Load data from API
  useEffect(() => {
    api.get('/tender/search', { params: { limit: 200 } })
      .then(res => {
        setTendersRaw(res.data || []);
        // Merge API statuses with localStorage — localStorage takes priority (user changes)
        const localStatuses = (() => {
          try { return JSON.parse(localStorage.getItem('lsi-internal-statuses') || '{}'); } catch { return {}; }
        })();
        const localNotes = (() => {
          try { return JSON.parse(localStorage.getItem('lsi-tender-notes') || '{}'); } catch { return {}; }
        })();
        
        const statusMap = {};
        const notesMap = {};
        (res.data || []).forEach(t => {
          t.id = t.kd_tender || t.id;
          let s = t.internalStatus || 'Dipantau';
          if (t.won === true) s = 'Menang';
          else if (s === 'Sudah Diikuti' && t.lost === true) s = 'Kalah';
          // localStorage overrides API (user's local changes take priority)
          statusMap[t.id] = localStatuses[t.id] || s;
          if (t.catatan_internal) {
            try { notesMap[t.id] = JSON.parse(t.catatan_internal); } catch { /* ignore */ }
          }
          // localStorage notes override API notes
          if (localNotes[t.id]) notesMap[t.id] = localNotes[t.id];
        });
        setInternalStatuses(prev => ({ ...statusMap, ...localStatuses }));
        setTenderNotes(prev => ({ ...notesMap, ...localNotes }));
      })
      .catch(() => {
        setTendersRaw(FALLBACK_TENDERS);
        // Load statuses from localStorage, fallback to dummy data defaults
        const localStatuses = (() => {
          try { return JSON.parse(localStorage.getItem('lsi-internal-statuses') || '{}'); } catch { return {}; }
        })();
        const statusMap = {};
        FALLBACK_TENDERS.forEach(t => {
          t.id = t.id || t.kd_tender;
          let s = t.internalStatus || 'Dipantau';
          if (t.won === true) s = 'Menang';
          else if (s === 'Sudah Diikuti' && t.lost === true) s = 'Kalah';
          statusMap[t.id] = localStatuses[t.id] || s;
        });
        setInternalStatuses(prev => ({ ...statusMap, ...localStatuses }));
        showToast('API tender belum tersambung. Dummy tender lokal dimuat.', 'error');
      })
      .finally(() => setLoadingTenders(false));
  }, []);

  useEffect(() => {
    api.get('/rup/search', { params: { limit: 100 } })
      .then(res => setRupRaw(res.data || []))
      .catch(() => {
        setRupRaw(FALLBACK_RUP);
        showToast('API RUP belum tersambung. Dummy RUP lokal dimuat.', 'error');
      })
      .finally(() => setLoadingRup(false));
  }, [showToast]);

  useEffect(() => {
    // Only load once - use ref to prevent re-loading
    if (expertsLoadedRef.current) {
      console.log('Experts already loaded, skipping API call');
      return;
    }
    
    expertsLoadedRef.current = true;
    console.log('Loading experts from API...');
    
    api.get('/experts')
      .then(res => {
        console.log('API response:', res.data);
        const apiExperts = (res.data || []).map(e => ({
          ...e,
          noHp: e.no_hp || '',
          portofolio: e.subporto || [],
          rating: e.rating_avg || 0,
          proyek: e.jumlah_proyek || 0,
          history: (e.projects || []).map(p => ({
             id: p.id, proyek: p.nama_proyek, klien: p.pemberi_kerja, tahun: p.tahun, peran: p.peran, nilai: p.nilai_proyek, bersama: p.bersama, status: p.status_proyek
          })),
          reviews: (e.reviews || []).map(r => ({
             id: r.id, reviewer: r.reviewer_nama, rating: r.rating, komentar: r.komentar, tanggal: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : ''
          }))
        }));
        
        // Merge with localStorage (in case there are local-only experts)
        setExpertsRaw(prev => {
          // Keep local experts that are not in API (ID > 1000000000000 are local)
          const localOnly = prev.filter(e => e.id > 1000000000000);
          const merged = [...localOnly, ...apiExperts];
          console.log('Merged experts (local + API):', merged);
          return merged;
        });
      })
      .catch((err) => {
        console.log('API failed, keeping localStorage data:', err);
        // Don't overwrite localStorage data if API fails
        if (expertsRaw.length === 0) {
          setExpertsRaw(FALLBACK_EXPERTS);
          showToast('API expert belum tersambung. Dummy tenaga ahli lokal dimuat.', 'error');
        }
      })
      .finally(() => setLoadingExperts(false));
  }, []); // Empty dependency - only run once on mount
  
  // Save experts to localStorage whenever it changes
  useEffect(() => {
    if (expertsRaw.length > 0) {
      try {
        localStorage.setItem('lsi-experts-local', JSON.stringify(expertsRaw));
      } catch (err) {
        console.error('Failed to save experts to localStorage:', err);
      }
    }
  }, [expertsRaw]);

  // Save internalStatuses to localStorage
  useEffect(() => {
    try {
      if (Object.keys(internalStatuses).length > 0) {
        localStorage.setItem('lsi-internal-statuses', JSON.stringify(internalStatuses));
      }
    } catch (err) {
      console.error('Failed to save internalStatuses to localStorage:', err);
    }
  }, [internalStatuses]);

  // Save tenderNotes to localStorage
  useEffect(() => {
    try {
      if (Object.keys(tenderNotes).length > 0) {
        localStorage.setItem('lsi-tender-notes', JSON.stringify(tenderNotes));
      }
    } catch (err) {
      console.error('Failed to save tenderNotes to localStorage:', err);
    }
  }, [tenderNotes]);

  // Save assignedPICs to localStorage
  useEffect(() => {
    try {
      if (Object.keys(assignedPICs).length > 0) {
        localStorage.setItem('lsi-assigned-pics', JSON.stringify(assignedPICs));
      }
    } catch (err) {
      console.error('Failed to save assignedPICs to localStorage:', err);
    }
  }, [assignedPICs]);

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

  const updateTenderStatus = useCallback(async (tenderId, newStatus) => {
    // 1. Update UI state immediately for responsiveness
    setInternalStatuses(prev => ({ ...prev, [tenderId]: newStatus }));
    
    // 2. Persist to Backend
    const tender = tenders.find(t => t.id === tenderId);
    try {
      await api.post('/watchlist', {
        kd_tender: parseInt(tenderId),
        status_internal: newStatus,
        nama_paket: tender?.nama || tender?.nama_paket,
        hps: tender?.hps
      });
      showToast(`Status tender diperbarui menjadi ${newStatus}`);
    } catch (e) {
      console.error("Failed to sync status to database", e);
      showToast("Gagal menyimpan status ke database, data hanya tersimpan sementara.", "error");
    }
  }, [tenders, showToast]);

  const updateTenderPIC = useCallback(async (tenderId, userId) => {
    setAssignedPICs(prev => ({ ...prev, [tenderId]: userId }));
    
    try {
      await api.post('/watchlist', {
        kd_tender: parseInt(tenderId),
        assigned_expert_ids: userId ? [parseInt(userId)] : []
      });
      showToast('PIC tender berhasil diatur');
    } catch (e) {
      console.error("Failed to sync PIC to database", e);
      showToast("Gagal menyimpan PIC ke database, hanya tersimpan lokal.", "error");
    }
  }, [showToast]);

  const addTenderNote = useCallback(async (tenderId, noteObj) => {
    const updatedNotes = [...(tenderNotes[tenderId] || []), noteObj];
    setTenderNotes(prev => ({ ...prev, [tenderId]: updatedNotes }));
    
    try {
      await api.post('/watchlist', {
        kd_tender: parseInt(tenderId),
        catatan_internal: JSON.stringify(updatedNotes)
      });
      showToast('Catatan ditambahkan');
    } catch (e) {
      console.error("Failed to sync notes", e);
      showToast('Gagal sinkronisasi catatan, hanya tersimpan lokal', 'error');
    }
  }, [tenderNotes, showToast]);

  const openTender = useCallback((id) => {
    markTenderOpened(id);
    setSelectedTenderId(id);
  }, [markTenderOpened]);

  const openRup = useCallback((id) => {
    markRupOpened(id);
    setSelectedRupId(id);
  }, [markRupOpened]);

  // Keyword actions
  const addKeyword = useCallback((portfolio, text) => {
    if (!text?.trim()) return;
    setKeywords(prev => ({
      ...prev,
      [portfolio]: [...prev[portfolio], { id: `${portfolio}-${Date.now()}`, text: text.trim(), active: true }]
    }));
  }, [showToast]);

  const removeKeyword = useCallback((portfolio, id) => {
    setKeywords(prev => ({ ...prev, [portfolio]: prev[portfolio].filter(k => k.id !== id) }));
  }, []);

  const clearKeywords = useCallback(() => {
    setKeywords(prev => Object.fromEntries(Object.keys(prev).map(portfolio => [portfolio, []])));
    showToast('Semua keyword berhasil dibersihkan');
  }, [showToast]);

  const updateKeyword = useCallback((portfolio, id, patch) => {
    setKeywords(prev => ({
      ...prev,
      [portfolio]: prev[portfolio].map(k => k.id === id ? { ...k, ...patch } : k)
    }));
  }, []);

  // Expert actions
  const addExpert = useCallback(async (draft) => {
    console.log('addExpert called with:', draft);
    
    // Handle keahlian - could be array or string
    let keahlianClean = [];
    if (Array.isArray(draft.keahlian)) {
      keahlianClean = draft.keahlian.filter(Boolean).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof draft.keahlian === 'string') {
      keahlianClean = draft.keahlian.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    console.log('Cleaned keahlian:', keahlianClean);
    
    if (!draft.nama?.trim()) {
      console.log('Validation failed: nama empty');
      showToast('Nama tenaga ahli wajib diisi', 'error');
      return false;
    }
    
    if (keahlianClean.length === 0) {
      console.log('Validation failed: keahlian empty');
      showToast('Minimal satu keahlian harus diisi', 'error');
      return false;
    }
    
    const body = {
      nama: draft.nama.trim(),
      no_hp: draft.noHp?.trim() || null,
      instansi: draft.instansi?.trim() || 'Eksternal SUCOFINDO',
      keahlian: keahlianClean,
      availability: draft.availability || 'Tersedia',
      subporto: [draft.portfolio || 'SDA'],
    };
    
    console.log('Prepared body for API:', body);
    
    try {
      console.log('Attempting API call to /experts');
      const res = await api.post('/experts', body);
      console.log('API response:', res.data);
      
      let historyFromApi = [];
      let jumlahProyek = 0;
      if (draft.history && draft.history.length > 0) {
        console.log('Adding history:', draft.history);
        for (const h of draft.history) {
          try {
            const pres = await api.post(`/experts/${res.data.id}/projects`, {
              nama_proyek: h.proyek,
              pemberi_kerja: h.klien || '-',
              tahun: h.tahun || new Date().getFullYear(),
              nilai_proyek: Number(h.nilai || 0),
              peran: h.peran || 'Tenaga Ahli',
              bersama: h.bersama || 'Sucofindo',
              status_proyek: h.status || 'Selesai'
            });
            historyFromApi.push({
               id: pres.data.id, proyek: pres.data.nama_proyek, klien: pres.data.pemberi_kerja, 
               tahun: pres.data.tahun, peran: pres.data.peran, nilai: pres.data.nilai_proyek, 
               bersama: pres.data.bersama, status: pres.data.status_proyek
            });
            jumlahProyek++;
          } catch(err) { 
            console.error("Failed to add project history", err); 
          }
        }
      }

      const newExpert = {
        ...res.data,
        noHp: res.data.no_hp || '',
        portofolio: res.data.subporto || [],
        rating: res.data.rating_avg || 0,
        proyek: res.data.jumlah_proyek + jumlahProyek,
        history: historyFromApi,
        reviews: [],
      };
      
      console.log('Adding expert to state:', newExpert);
      setExpertsRaw(prev => {
        const updated = [newExpert, ...prev]; // Add to beginning
        console.log('Updated experts list:', updated);
        return updated;
      });
      showToast('Tenaga ahli berhasil ditambahkan');
      return true;
    } catch (e) {
      console.error('API call failed, using fallback:', e);
      // Fallback: save to local state
      const fallbackExpert = { 
        ...body, 
        id: Date.now(), 
        noHp: draft.noHp || '', 
        portofolio: body.subporto, 
        rating: 0, 
        proyek: draft.history?.length || 0, 
        history: draft.history || [], 
        reviews: [], 
        keahlian: keahlianClean 
      };
      
      console.log('Adding fallback expert to state:', fallbackExpert);
      setExpertsRaw(prev => {
        const updated = [fallbackExpert, ...prev]; // Add to beginning
        console.log('Updated experts list (fallback):', updated);
        return updated;
      });
      showToast('API expert belum tersambung. Data expert disimpan sementara di browser.', 'warning');
      return true;
    }
  }, [showToast]);

  const updateExpertName = useCallback((expertId, nama) => {
    setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? { ...e, nama } : e));
  }, [showToast]);

  const updateExpertProfile = useCallback(async (expertId, patch) => {
    const safePatch = {
      nama: patch?.nama?.trim(),
      no_hp: patch?.noHp?.trim(),
      instansi: patch?.instansi?.trim(),
    };
    try {
      await api.patch(`/experts/${expertId}`, safePatch);
    } catch {
      // Keep local fallback update when API is unavailable.
    }
    setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? { ...e, nama: safePatch.nama, noHp: patch?.noHp?.trim(), instansi: safePatch.instansi } : e));
    showToast('Profil tenaga ahli berhasil diperbarui');
  }, [showToast]);

  const deleteExpert = useCallback(async (expertId) => {
    try {
      await api.delete(`/experts/${expertId}`);
      setExpertsRaw(prev => prev.filter(e => String(e.id) !== String(expertId)));
      setSelectedExpertId(null);
      showToast('Tenaga ahli berhasil dihapus');
    } catch (err) {
      console.error('Failed to delete expert:', err);
      // Still remove from local state even if API fails
      setExpertsRaw(prev => prev.filter(e => String(e.id) !== String(expertId)));
      setSelectedExpertId(null);
      showToast('Gagal terhubung API. Dihapus dari tampilan lokal.', 'warning');
    }
  }, [showToast, setSelectedExpertId]);

  const addReview = useCallback(async (expertId) => {
    if (!reviewDraft.reviewer?.trim() || !reviewDraft.komentar?.trim()) {
      showToast('Nama reviewer dan komentar wajib diisi', 'error');
      return;
    }
    try {
      const res = await api.post(`/experts/${expertId}/reviews`, {
        reviewer_nama: reviewDraft.reviewer,
        rating: reviewDraft.rating,
        komentar: reviewDraft.komentar
      });
      const newReview = { id: res.data.id, reviewer: res.data.reviewer_nama, rating: res.data.rating, komentar: res.data.komentar, tanggal: new Date().toLocaleDateString('id-ID') };
      setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
        ...e,
        reviews: [...(e.reviews || []), newReview],
        rating: Number(((e.rating * (e.reviews || []).length + reviewDraft.rating) / ((e.reviews || []).length + 1)).toFixed(1))
      } : e));
      setReviewDraft({ reviewer: '', rating: 5, komentar: '' });
      showToast('Review berhasil disimpan');
    } catch (e) {
      showToast('Gagal menyimpan review ke database', 'error');
    }
  }, [reviewDraft, showToast]);

  const addHistory = useCallback(async (expertId) => {
    if (!historyDraft.proyek?.trim()) {
      showToast('Nama proyek wajib diisi', 'error');
      return;
    }
    try {
      const res = await api.post(`/experts/${expertId}/projects`, {
        nama_proyek: historyDraft.proyek,
        pemberi_kerja: historyDraft.klien || '-',
        tahun: historyDraft.tahun || new Date().getFullYear(),
        nilai_proyek: Number(historyDraft.nilai || 0) * 1000000,
        peran: historyDraft.peran || 'Tenaga Ahli',
        bersama: historyDraft.bersama || 'Sucofindo',
        status_proyek: 'Selesai'
      });
      const newProject = { id: res.data.id, proyek: res.data.nama_proyek, klien: res.data.pemberi_kerja, tahun: res.data.tahun, peran: res.data.peran, nilai: res.data.nilai_proyek, bersama: res.data.bersama, status: res.data.status_proyek };
      setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
        ...e,
        history: [...(e.history || []), newProject],
        proyek: (e.proyek || 0) + 1
      } : e));
      setHistoryDraft({ proyek: '', klien: '', tahun: '', nilai: '', peran: '', bersama: 'Sucofindo' });
      showToast('Riwayat berhasil disimpan');
    } catch (e) {
      showToast('Gagal menyimpan riwayat ke database', 'error');
    }
  }, [historyDraft, showToast]);

  const deleteExpertHistory = useCallback(async (expertId, projectId) => {
    try {
      await api.delete(`/experts/${expertId}/projects/${projectId}`);
      setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
        ...e, history: (e.history || []).filter(h => String(h.id) !== String(projectId))
      } : e));
      showToast('Riwayat berhasil dihapus');
    } catch (e) {
      showToast('Gagal menghapus riwayat', 'error');
    }
  }, [showToast]);


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

  const value = useMemo(() => ({
    // Sidebar
    sidebarCollapsed, setSidebarCollapsed,
    // Toast
    toast, 
    showToast,
    toasts: toast.toasts,
    removeToast: toast.removeToast,
    // Data
    tenders, rupPlans, expertsRaw, setExpertsRaw,
    rupList: rupPlans,
    experts: expertsRaw,
    loadingTenders, loadingRup, loadingExperts,
    // Derived
    keywordCount, totalPotensi, relevantCount, urgentCount,
    // Keywords
    keywords, setKeywords, addKeyword, removeKeyword, clearKeywords, updateKeyword,
    // Internal state
    internalStatuses, updateTenderStatus,
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
    addExpert, updateExpertName, updateExpertProfile, deleteExpert, deleteExpertHistory,
    reviewDraft, setReviewDraft, addReview,
    historyDraft, setHistoryDraft, addHistory,
  }), [
    sidebarCollapsed, toast, showToast,
    tenders, rupPlans, expertsRaw,
    loadingTenders, loadingRup, loadingExperts,
    keywordCount, totalPotensi, relevantCount, urgentCount,
    keywords, addKeyword, removeKeyword, clearKeywords, updateKeyword,
    internalStatuses, updateTenderStatus, tenderNotes, setTenderNotes, addTenderNote,
    assignedPICs, updateTenderPIC,
    users, addUser, updateUser, deleteUser,
    notifications, coverage, hpsThreshold,
    selectedTenderId, selectedExpertId, selectedRupId,
    selectedTender, selectedExpert, selectedRup,
    newTenderIds, newRupIds, openTender, openRup,
    markTenderOpened, markRupOpened,
    showWinrateDetail, showStageRef, showPotensiChart, showUrgentPanel, showKeywordManager,
    dashboardChartFilter,
    addExpert, updateExpertName, updateExpertProfile, deleteExpert, deleteExpertHistory,
    reviewDraft, addReview, historyDraft, addHistory,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

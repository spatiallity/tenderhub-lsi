import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';
import supabase from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_KEYWORDS, DEFAULT_USERS, PROVINCES } from '../utils/constants';
import { getRegion } from '../utils/unitKerja';
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
  const { user, isGuest, profile } = useAuth();
  const callerUnitKerja = profile?.unit_kerja ?? null;
  const callerRole = profile?.role ?? 'user';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toast = useToast();

  // Keywords state - will be loaded from Supabase
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);
  const [loadingKeywords, setLoadingKeywords] = useState(true);

  // Tenders state from API
  const [tendersRaw, setTendersRaw] = useState([]);
  const [rupRaw, setRupRaw] = useState([]);
  const [expertsRaw, setExpertsRaw] = useState([]);
  // Real names from contact_persons table — used to replace dummy reviewer names.
  const [contactNames, setContactNames] = useState([]);
  const [loadingTenders, setLoadingTenders] = useState(true);
  const [loadingRup, setLoadingRup] = useState(true);
  const [loadingExperts, setLoadingExperts] = useState(true);

  // Internal state (like mockup)
  const [internalStatuses, setInternalStatuses] = useState({});
  // tender claim ownership: { [tenderId]: { unit_kerja, unit_kerja_region } }
  const [tenderClaims, setTenderClaims] = useState({});
  // rup claim + status: { [rupId]: { unit_kerja, unit_kerja_region, status_internal, catatan_internal } }
  const [rupClaims, setRupClaims] = useState({});
  const [tenderNotes, setTenderNotes] = useState({});
  const [noteSaved, setNoteSaved] = useState({});
  const [assignedPICs, setAssignedPICs] = useState({});
  const [expertCVs, setExpertCVs] = useState({});
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [notifications, setNotifications] = useState({ baru: true, deadline: true, status: true, ta: true });
  const [coverage, setCoverage] = useState(() => {
    // Persist coverage selection in localStorage. Default: all 38 provinsi aktif.
    try {
      const saved = JSON.parse(localStorage.getItem('lsi-coverage') || 'null');
      const map = new Map((saved || []).map(c => [c.name, !!c.active]));
      return PROVINCES.map(name => ({ name, active: map.has(name) ? map.get(name) : true }));
    } catch {
      return PROVINCES.map(name => ({ name, active: true }));
    }
  });
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
        // Use dummy tender data (no backend API needed)
        console.log('[Direct Supabase] Using local tender data');
        setTendersRaw(FALLBACK_TENDERS);

        const statusMap = {};
        const picsMap = {};
        const notesMap = {};

        // Fetch watchlist from Supabase directly
        const claimsMap = {};
        try {
          const { data: watchlistData, error } = await supabase
            .from('tender_watchlist')
            .select('kd_tender, status_internal, assigned_pic, catatan_internal, unit_kerja, unit_kerja_region');

          if (!error && watchlistData) {
            watchlistData.forEach(w => {
              const tenderId = w.kd_tender;
              if (w.status_internal) statusMap[tenderId] = w.status_internal;
              if (w.assigned_pic) picsMap[tenderId] = w.assigned_pic;
              if (w.catatan_internal) {
                try { notesMap[tenderId] = JSON.parse(w.catatan_internal); } catch {}
              }
              if (w.unit_kerja) {
                claimsMap[tenderId] = {
                  unit_kerja: w.unit_kerja,
                  unit_kerja_region: w.unit_kerja_region || getRegion(w.unit_kerja),
                };
              }
            });
          } else if (error) {
            console.error('Supabase watchlist error:', error.message);
          }
        } catch (watchlistErr) {
          console.error('Failed to load watchlist:', watchlistErr);
        }
        setTenderClaims(claimsMap);

        // Fill defaults for tenders not in watchlist
        FALLBACK_TENDERS.forEach(t => {
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
  }, []); // Run only once on mount

  useEffect(() => {
    const loadRup = async () => {
      try {
        const res = await api.get('/rup/search', { params: { limit: 100 } });
        setRupRaw(res.data || []);
      } catch (err) {
        console.error('[AppContext] Failed to load RUP:', err);
        setRupRaw(FALLBACK_RUP);
        showToast('API RUP belum tersambung. Dummy RUP lokal dimuat.', 'error');
      } finally {
        setLoadingRup(false);
      }
    };

    loadRup();
  }, []); // Run only once on mount

  // Load real names from contact_persons (used as expert reviewers).
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('contact_persons')
          .select('nama')
          .order('nama', { ascending: true });
        if (error) { console.warn('[contact_persons] load failed', error.message); return; }
        const names = (data || []).map(c => c.nama).filter(Boolean);
        if (names.length) setContactNames(names);
      } catch (e) { console.warn('[contact_persons] load exception', e); }
    })();
  }, []);

  // Load RUP watchlist (claim + status) from Supabase.
  useEffect(() => {
    const loadRupClaims = async () => {
      try {
        const { data, error } = await supabase
          .from('rup_watchlist')
          .select('kd_rup, status_internal, catatan_internal, unit_kerja, unit_kerja_region');
        if (error) { console.warn('[rup_watchlist] load failed', error.message); return; }
        const map = {};
        (data || []).forEach(r => {
          map[r.kd_rup] = {
            status_internal: r.status_internal || 'Dipantau',
            catatan_internal: r.catatan_internal || null,
            unit_kerja: r.unit_kerja || null,
            unit_kerja_region: r.unit_kerja_region || getRegion(r.unit_kerja),
          };
        });
        setRupClaims(map);
      } catch (e) { console.warn('[rup_watchlist] load exception', e); }
    };
    loadRupClaims();
  }, []);

  useEffect(() => {
    api.get('/experts')
      .then(res => {
        // Transform API response from snake_case to camelCase
        const transformedExperts = (res.data || []).map(e => ({
          ...e,
          noHp: e.no_hp || '',
          portofolio: e.subporto || [],
          rating: e.rating_avg || 0,
          proyek: e.jumlah_proyek || 0,
          history: (e.projects || []).map(p => ({
            id: p.id,
            proyek: p.nama_proyek,
            klien: p.pemberi_kerja,
            tahun: p.tahun,
            peran: p.peran,
            nilai: p.nilai_proyek,
            bersama: p.bersama,
            status: p.status_proyek,
            // CV Template fields preserved for form editing and generation
            nama_proyek: p.nama_proyek,
            nama_perusahaan_lain: p.nama_perusahaan_lain,
            lokasi_proyek: p.lokasi_proyek,
            pengguna_jasa: p.pengguna_jasa,
            uraian_tugas: p.uraian_tugas,
            waktu_mulai: p.waktu_mulai,
            waktu_selesai: p.waktu_selesai,
            posisi_penugasan: p.posisi_penugasan,
            status_kepegawaian: p.status_kepegawaian,
            surat_referensi: p.surat_referensi,
          })),
          reviews: (e.reviews || []).map(r => ({
            id: r.id,
            reviewer: r.reviewer_nama,
            rating: r.rating,
            komentar: r.komentar,
            tanggal: new Date(r.created_at).toLocaleDateString('id-ID')
          }))
        }));
        // Sort by ID descending (newest first)
        const sortedExperts = transformedExperts.sort((a, b) => (b.id || 0) - (a.id || 0));
        setExpertsRaw(sortedExperts);
      })
      .catch(() => {
        // Sort fallback data by ID descending (newest first)
        const sortedFallback = [...FALLBACK_EXPERTS].sort((a, b) => (b.id || 0) - (a.id || 0));
        setExpertsRaw(sortedFallback);
        showToast('API expert belum tersambung. Dummy tenaga ahli lokal dimuat.', 'error');
      })
      .finally(() => setLoadingExperts(false));
  }, []); // Removed showToast - run only once

  // Admin hide-lists (kd_tender / kd_rup) — loaded from Supabase.
  const [hiddenTenderIds, setHiddenTenderIds] = useState(() => new Set());
  const [hiddenRupIds, setHiddenRupIds] = useState(() => new Set());

  const reloadHideLists = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([
        supabase.from('tender_hidden').select('kd_tender'),
        supabase.from('rup_hidden').select('kd_rup'),
      ]);
      if (!t.error) setHiddenTenderIds(new Set((t.data || []).map(x => String(x.kd_tender))));
      if (!r.error) setHiddenRupIds(new Set((r.data || []).map(x => String(x.kd_rup))));
    } catch (e) {
      console.warn('[hide-lists] load failed', e);
    }
  }, []);

  useEffect(() => { reloadHideLists(); }, [reloadHideLists]);

  const hideTender = useCallback(async (kdTender, reason) => {
    const { error } = await supabase.from('tender_hidden').insert({ kd_tender: String(kdTender), reason: reason || null });
    if (error) throw error;
    setHiddenTenderIds(prev => new Set(prev).add(String(kdTender)));
  }, []);

  const hideRup = useCallback(async (kdRup, reason) => {
    const { error } = await supabase.from('rup_hidden').insert({ kd_rup: String(kdRup), reason: reason || null });
    if (error) throw error;
    setHiddenRupIds(prev => new Set(prev).add(String(kdRup)));
  }, []);

  const deleteImportedRup = useCallback(async (kdRup) => {
    const { error } = await supabase.from('rup_imports').delete().eq('kd_rup', String(kdRup));
    if (error) throw error;
  }, []);

  // Phase 1: Heavy enrichment (relevance, stages, deadlines) — only re-runs when raw data or keywords change
  const tendersEnriched = useMemo(() =>
    tendersRaw
      .filter(t => !hiddenTenderIds.has(String(t.kd_tender ?? t.id)))
      .map(t => enrichTender(t, keywords, {})),
    [tendersRaw, keywords, hiddenTenderIds]
  );

  // Phase 2: Cheap status overlay — only re-runs when internalStatuses change (lightweight merge)
  const tenders = useMemo(() =>
    tendersEnriched.map(t => {
      const status = (internalStatuses[t.id] || t.internalStatus || 'Dipantau').trim();
      return status !== t.internalStatus ? { ...t, internalStatus: status } : t;
    }),
    [tendersEnriched, internalStatuses]
  );

  // Enriched RUP (also drop hidden kd_rup).
  const rupPlans = useMemo(() =>
    rupRaw
      .filter(r => !hiddenRupIds.has(String(r.kd_rup)))
      .map(r => ({ ...r, ...calcRupMatch(r, keywords) })),
    [rupRaw, keywords, hiddenRupIds]
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

  // Override dummy reviewer names with real names from contact_persons.
  // Deterministic: review.id (or fallback hash) modulo contact list.
  const expertsWithRealReviewers = useMemo(() => {
    if (!contactNames.length) return expertsRaw;
    return expertsRaw.map(e => ({
      ...e,
      reviews: (e.reviews || []).map((r, idx) => ({
        ...r,
        reviewer: contactNames[((r.id || idx) >>> 0) % contactNames.length],
      })),
    }));
  }, [expertsRaw, contactNames]);

  // Selected items
  const selectedTender = useMemo(() => tenders.find(t => t.id === selectedTenderId), [tenders, selectedTenderId]);
  const selectedExpert = useMemo(() => expertsWithRealReviewers.find(e => e.id === selectedExpertId), [expertsWithRealReviewers, selectedExpertId]);
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
      no_hp: draft.noHp?.trim() || null,
      instansi: draft.instansi?.trim() || 'Eksternal SUCOFINDO',
      keahlian: [draft.keahlian.trim()],
      availability: draft.availability || 'Tersedia',
      subporto: [draft.portfolio || 'SDA'],
      rating_avg: 4.2,
      jumlah_proyek: 0,
    };
    
    try {
      const res = await api.post('/experts', body);
      // Transform response to match frontend format
      const transformedExpert = {
        ...res.data,
        noHp: res.data.no_hp || '',
        portofolio: res.data.subporto || [],
        rating: res.data.rating_avg || 0,
        proyek: res.data.jumlah_proyek || 0,
        history: [],
        reviews: []
      };
      // Add new expert at the beginning of the array (newest first)
      setExpertsRaw(prev => [transformedExpert, ...prev]);
      showToast('Tenaga ahli berhasil ditambahkan');
      return true; // ✅ Return success
    } catch (e) {
      console.error('[addExpert] Failed to add expert:', e);
      const fallbackExpert = { 
        id: Date.now(), 
        nama: draft.nama.trim(),
        noHp: draft.noHp?.trim() || '', 
        instansi: draft.instansi?.trim() || 'Eksternal SUCOFINDO',
        keahlian: [draft.keahlian.trim()],
        availability: draft.availability || 'Tersedia',
        portofolio: [draft.portfolio || 'SDA'],
        rating: 4.2,
        proyek: 0,
        history: [], 
        reviews: [] 
      };
      // Add new expert at the beginning of the array (newest first)
      setExpertsRaw(prev => [fallbackExpert, ...prev]);
      showToast('Tenaga ahli berhasil ditambahkan (disimpan lokal)', 'warning');
      return true; // ✅ Still return success since data was added locally
    }
  }, [showToast]);

  const updateExpertName = useCallback((expertId, nama) => {
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? { ...e, nama } : e));
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
    // Update local state with camelCase version
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? { 
      ...e, 
      nama: safePatch.nama || e.nama,
      noHp: safePatch.no_hp || e.noHp,
      instansi: safePatch.instansi || e.instansi
    } : e));
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

  const addHistory = useCallback(async (expertId) => {
    if (!historyDraft.proyek.trim() || !historyDraft.klien.trim()) return;

    const projectBody = {
      nama_proyek: historyDraft.proyek,
      pemberi_kerja: historyDraft.klien,
      tahun: historyDraft.tahun ? parseInt(historyDraft.tahun) : new Date().getFullYear(),
      nilai_proyek: Number(historyDraft.nilai || 0) * 1000000,
      peran: historyDraft.peran || 'Tenaga Ahli',
      bersama: historyDraft.bersama,
      status_proyek: 'Selesai',
    };

    try {
      const res = await api.post(`/experts/${expertId}/projects`, projectBody);
      const p = res.data;
      setExpertsRaw(prev => prev.map(e => e.id === expertId ? {
        ...e,
        history: [...(e.history || []), {
          id: p.id,
          proyek: p.nama_proyek,
          klien: p.pemberi_kerja,
          tahun: p.tahun,
          peran: p.peran,
          nilai: p.nilai_proyek,
          bersama: p.bersama,
          status: p.status_proyek,
          nama_proyek: p.nama_proyek,
          nama_perusahaan_lain: p.nama_perusahaan_lain,
          lokasi_proyek: p.lokasi_proyek,
          pengguna_jasa: p.pengguna_jasa,
          uraian_tugas: p.uraian_tugas,
          waktu_mulai: p.waktu_mulai,
          waktu_selesai: p.waktu_selesai,
          posisi_penugasan: p.posisi_penugasan,
          status_kepegawaian: p.status_kepegawaian,
          surat_referensi: p.surat_referensi,
        }],
        proyek: (e.proyek || 0) + 1
      } : e));
      showToast('Riwayat berhasil disimpan');
    } catch (err) {
      console.error('[addHistory]', err);
      setExpertsRaw(prev => prev.map(e => e.id === expertId ? {
        ...e,
        history: [...(e.history || []), {
          id: Date.now(),
          proyek: historyDraft.proyek,
          klien: historyDraft.klien,
          tahun: historyDraft.tahun || new Date().getFullYear(),
          nilai: Number(historyDraft.nilai || 0) * 1000000,
          peran: historyDraft.peran || 'Tenaga Ahli',
          bersama: historyDraft.bersama,
          status: 'Selesai',
        }],
        proyek: (e.proyek || 0) + 1
      } : e));
      showToast('Riwayat disimpan lokal (API belum tersambung)', 'warning');
    }
    setHistoryDraft({ proyek: '', klien: '', tahun: '', nilai: '', peran: '', bersama: 'Sucofindo' });
  }, [historyDraft, showToast]);

  const deleteExpertHistory = useCallback(async (expertId, projectId) => {
    try {
      await api.delete(`/experts/projects/${projectId}`);
    } catch (err) {
      console.error('[deleteExpertHistory]', err);
    }
    setExpertsRaw(prev => prev.map(e => e.id === expertId ? {
      ...e,
      history: (e.history || []).filter(h => h.id !== projectId),
      proyek: Math.max(0, (e.proyek || 0) - 1),
    } : e));
    showToast('Riwayat berhasil dihapus');
  }, [showToast]);

  const updateExpertProject = useCallback(async (expertId, projectId, projectData) => {
    try {
      await api.patch(`/experts/projects/${projectId}`, projectData);
      setExpertsRaw(prev => prev.map(e => e.id === expertId ? {
        ...e,
        history: (e.history || []).map(h => h.id === projectId ? { ...h, ...projectData } : h),
      } : e));
      showToast('Data proyek berhasil diperbarui');
      return true;
    } catch (err) {
      console.error('[updateExpertProject]', err);
      showToast('Gagal menyimpan data proyek', 'error');
      return false;
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

  const refetchTenders = useCallback(async () => {
    try {
      console.log('[Direct Supabase] Refetching watchlist only');
      
      const statusMap = {};
      const picsMap = {};
      const notesMap = {};

      // Fetch watchlist from Supabase
      try {
        const { data: watchlistData, error } = await supabase
          .from('tender_watchlist')
          .select('kd_tender, status_internal, assigned_pic, catatan_internal');

        if (!error && watchlistData) {
          watchlistData.forEach(w => {
            if (w.status_internal) statusMap[w.kd_tender] = w.status_internal;
            if (w.assigned_pic) picsMap[w.kd_tender] = w.assigned_pic;
            if (w.catatan_internal) {
              try { notesMap[w.kd_tender] = JSON.parse(w.catatan_internal); } catch {}
            }
          });
        }
        
        // Update states with watchlist data
        setInternalStatuses(prev => ({ ...prev, ...statusMap }));
        setAssignedPICs(prev => ({ ...prev, ...picsMap }));
        setTenderNotes(prev => ({ ...prev, ...notesMap }));
        
      } catch (watchlistErr) {
        console.error('Failed to refetch watchlist:', watchlistErr);
      }
    } catch (err) {
      console.error('Failed to refetch:', err);
    }
  }, []);

  // Helper: upsert a watchlist entry via Supabase directly
  const ensureWatchlistEntry = useCallback(async (tenderId, patch = {}) => {
    try {
      const tender = tenders.find(t => t.id === tenderId);
      
      // Check if entry exists
      const { data: existing, error: selectError } = await supabase
        .from('tender_watchlist')
        .select('id')
        .eq('kd_tender', parseInt(tenderId))
        .maybeSingle();
      
      if (selectError) {
        console.error('[ensureWatchlistEntry] Select error:', selectError);
        throw new Error(selectError.message);
      }
      
      // Determine claim ownership. If no row exists yet and caller has a unit_kerja,
      // they auto-claim it. Existing claim is left intact unless caller is admin
      // explicitly reassigning via patch.unit_kerja.
      const existingClaim = tenderClaims[tenderId]?.unit_kerja || null;
      const claimOwner = patch.unit_kerja ?? existingClaim ?? callerUnitKerja ?? null;

      // Build payload with only valid fields from the database schema
      const basePayload = {
        kd_tender: parseInt(tenderId),
        status_internal: patch.status_internal ?? (internalStatuses[tenderId] || 'Dipantau'),
        nama_paket: tender?.nama || tender?.nama_paket || null,
        hps: tender?.hps || null,
      };
      if (claimOwner) {
        basePayload.unit_kerja = claimOwner;
        basePayload.unit_kerja_region = getRegion(claimOwner);
      }

      // Add optional fields from patch if they exist
      if (patch.assigned_pic !== undefined) basePayload.assigned_pic = patch.assigned_pic;
      if (patch.catatan_internal !== undefined) basePayload.catatan_internal = patch.catatan_internal;
      if (patch.nama_klpd !== undefined) basePayload.nama_klpd = patch.nama_klpd;
      if (patch.assigned_expert_ids !== undefined) basePayload.assigned_expert_ids = patch.assigned_expert_ids;
      if (patch.subporto_rekomendasi !== undefined) basePayload.subporto_rekomendasi = patch.subporto_rekomendasi;
      if (patch.relevance_score !== undefined) basePayload.relevance_score = patch.relevance_score;
      
      console.log('[ensureWatchlistEntry] Payload:', basePayload);
      
      if (existing && existing.id) {
        // Update existing entry - remove kd_tender from update payload
        const updatePayload = { ...basePayload };
        delete updatePayload.kd_tender; // Don't update the primary key
        
        console.log('[ensureWatchlistEntry] Updating existing entry ID:', existing.id);
        console.log('[ensureWatchlistEntry] Update payload:', JSON.stringify(updatePayload, null, 2));
        
        const { data, error, status, statusText } = await supabase
          .from('tender_watchlist')
          .update(updatePayload)
          .eq('id', existing.id)
          .select();
        
        console.log('[ensureWatchlistEntry] Update response:', { data, error, status, statusText });
        
        if (error) {
          console.error('[ensureWatchlistEntry] Update error:', error);
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          console.error('[ensureWatchlistEntry] Update returned no data - possible RLS policy issue');
          throw new Error('Update failed - no data returned');
        }
        
        console.log('[ensureWatchlistEntry] Update successful, updated row:', JSON.stringify(data[0], null, 2));
      } else {
        // Insert new entry
        console.log('[ensureWatchlistEntry] Inserting new entry for tender:', tenderId);
        const { data, error } = await supabase
          .from('tender_watchlist')
          .insert(basePayload)
          .select();
        
        if (error) {
          console.error('[ensureWatchlistEntry] Insert error:', error);
          throw new Error(error.message);
        }
        console.log('[ensureWatchlistEntry] Insert successful, data:', data);
      }
      // Sync local claim cache if a new claim was made.
      if (claimOwner && existingClaim !== claimOwner) {
        setTenderClaims(prev => ({
          ...prev,
          [tenderId]: { unit_kerja: claimOwner, unit_kerja_region: getRegion(claimOwner) },
        }));
      }
    } catch (err) {
      console.error('[ensureWatchlistEntry] Failed:', err);
      throw err;
    }
  }, [tenders, internalStatuses, tenderClaims, callerUnitKerja]);

  const updateTenderStatus = useCallback(async (tenderId, newStatus) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menyimpan perubahan', 'warning');
      return;
    }

    // Enforce: tender can be claimed by only one branch.
    const existingClaim = tenderClaims[tenderId]?.unit_kerja || null;
    if (existingClaim && callerRole !== 'admin' && existingClaim !== callerUnitKerja) {
      showToast(`Tender ini di-claim oleh ${existingClaim}; Anda hanya bisa lihat.`, 'warning');
      return;
    }

    const tender = tenders.find(t => t.id === tenderId);

    // Enforce: "Menang" only allowed after Pengumuman Pemenang stage
    if (newStatus === 'Menang') {
      const stageName = (tender?.currentStageName || '').toLowerCase();
      const canBeWon =
        stageName.includes('pengumuman pemenang') ||
        stageName.includes('masa sanggah') ||
        stageName.includes('penunjukan') ||
        stageName.includes('kontrak');

      if (!canBeWon) {
        showToast('Status "Menang" hanya bisa diset setelah tahap Pengumuman Pemenang', 'warning');
        return;
      }
    }

    // Enforce: "Akan Diikuti" tidak boleh kalau sudah lewat tahap pengumpulan dokumen.
    //   Prakualifikasi → cutoff stage 4 (Kirim Persyaratan Kualifikasi)
    //   Pascakualifikasi → cutoff stage 4 (Upload Dokumen Penawaran)
    if (newStatus === 'Akan Diikuti') {
      const cutoff = 4;
      if ((tender?.currentStage || 0) > cutoff) {
        const tahapText = tender?.metode === 'Prakualifikasi' ? 'Kirim Persyaratan Kualifikasi' : 'Upload Dokumen Penawaran';
        showToast(`Tidak bisa "Akan Diikuti" — sudah lewat tahap ${tahapText}. Pakai Sudah Diikuti / Menang / Kalah.`, 'warning');
        return;
      }
    }

    // Save old status for rollback
    const oldStatus = internalStatuses[tenderId];
    
    // Optimistic update
    console.log('[updateTenderStatus] Updating status:', tenderId, newStatus);
    window.dispatchEvent(new CustomEvent('tender-local-update', { detail: { tenderId } }));
    setInternalStatuses(prev => ({ ...prev, [tenderId]: newStatus }));

    try {
      await ensureWatchlistEntry(tenderId, { status_internal: newStatus });
      console.log('[updateTenderStatus] Status saved successfully');
      showToast('Status berhasil diperbarui');
    } catch (err) {
      console.error('[updateTenderStatus] Failed to save:', err);
      // Rollback to old status
      setInternalStatuses(prev => ({ ...prev, [tenderId]: oldStatus }));
      showToast('Gagal menyimpan status ke database', 'error');
    }
  }, [user, isGuest, tenders, internalStatuses, ensureWatchlistEntry, showToast, tenderClaims, callerUnitKerja, callerRole]);

  // Update RUP claim + status. Mirrors updateTenderStatus.
  const updateRupStatus = useCallback(async (rupId, newStatus, rupRow) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menyimpan perubahan', 'warning');
      return;
    }
    const kdRup = String(rupRow?.kd_rup || rupId);
    const existingClaim = rupClaims[kdRup]?.unit_kerja || null;
    if (existingClaim && callerRole !== 'admin' && existingClaim !== callerUnitKerja) {
      showToast(`RUP ini di-claim oleh ${existingClaim}; Anda hanya bisa lihat.`, 'warning');
      return;
    }
    const claimOwner = existingClaim ?? callerUnitKerja ?? null;
    const oldClaim = rupClaims[kdRup];

    // Optimistic
    setRupClaims(prev => ({
      ...prev,
      [kdRup]: {
        ...(prev[kdRup] || {}),
        status_internal: newStatus,
        unit_kerja: claimOwner,
        unit_kerja_region: claimOwner ? getRegion(claimOwner) : null,
      },
    }));

    try {
      const payload = {
        kd_rup: kdRup,
        nama_paket: rupRow?.nama_paket || null,
        nama_klpd: rupRow?.nama_klpd || null,
        pagu: rupRow?.pagu || null,
        status_internal: newStatus,
      };
      if (claimOwner) {
        payload.unit_kerja = claimOwner;
        payload.unit_kerja_region = getRegion(claimOwner);
      }
      const { error } = await supabase
        .from('rup_watchlist')
        .upsert(payload, { onConflict: 'kd_rup' });
      if (error) throw error;
      showToast('Status RUP berhasil diperbarui');
    } catch (err) {
      console.error('[updateRupStatus] Failed:', err);
      setRupClaims(prev => ({ ...prev, [kdRup]: oldClaim }));
      showToast('Gagal menyimpan status RUP', 'error');
    }
  }, [user, isGuest, rupClaims, callerUnitKerja, callerRole, showToast]);

  // Admin: release / reassign tender claim.
  const releaseTenderClaim = useCallback(async (tenderId) => {
    if (callerRole !== 'admin') { showToast('Admin only', 'warning'); return; }
    try {
      const { error } = await supabase
        .from('tender_watchlist')
        .update({ unit_kerja: null, unit_kerja_region: null, claimed_by: null, claimed_at: null })
        .eq('kd_tender', parseInt(tenderId));
      if (error) throw error;
      setTenderClaims(prev => { const next = { ...prev }; delete next[tenderId]; return next; });
      showToast('Claim cabang dilepas');
    } catch (e) { showToast(`Gagal release: ${e.message}`, 'error'); }
  }, [callerRole, showToast]);

  const reassignTenderClaim = useCallback(async (tenderId, newUnit) => {
    if (callerRole !== 'admin') { showToast('Admin only', 'warning'); return; }
    try {
      const { error } = await supabase
        .from('tender_watchlist')
        .update({ unit_kerja: newUnit, unit_kerja_region: getRegion(newUnit), claimed_at: new Date().toISOString() })
        .eq('kd_tender', parseInt(tenderId));
      if (error) throw error;
      setTenderClaims(prev => ({ ...prev, [tenderId]: { unit_kerja: newUnit, unit_kerja_region: getRegion(newUnit) } }));
      showToast(`Tender di-reassign ke ${newUnit}`);
    } catch (e) { showToast(`Gagal reassign: ${e.message}`, 'error'); }
  }, [callerRole, showToast]);

  const updateTenderPIC = useCallback(async (tenderId, userId) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menyimpan perubahan', 'warning');
      return;
    }

    // Save old PIC for rollback
    const oldPIC = assignedPICs[tenderId];
    
    // Optimistic update
    console.log('[updateTenderPIC] Updating PIC:', tenderId, userId);
    window.dispatchEvent(new CustomEvent('tender-local-update', { detail: { tenderId } }));
    setAssignedPICs(prev => ({ ...prev, [tenderId]: userId }));

    try {
      await ensureWatchlistEntry(tenderId, { assigned_pic: userId || null });
      console.log('[updateTenderPIC] PIC saved successfully');
      showToast('PIC berhasil diperbarui');
    } catch (err) {
      console.error('[updateTenderPIC] Failed to save:', err);
      // Rollback to old PIC
      setAssignedPICs(prev => ({ ...prev, [tenderId]: oldPIC }));
      showToast('Gagal menyimpan PIC ke database', 'error');
    }
  }, [user, isGuest, assignedPICs, ensureWatchlistEntry, showToast]);

  const addTenderNote = useCallback(async (tenderId, noteObj) => {
    if (!user || isGuest) {
      showToast('Anda harus login untuk menambahkan catatan', 'warning');
      return;
    }

    // Save old notes for rollback
    const oldNotes = tenderNotes[tenderId] || [];
    const updatedNotes = [...oldNotes, noteObj];
    
    // Optimistic update
    console.log('[addTenderNote] Adding note:', tenderId);
    window.dispatchEvent(new CustomEvent('tender-local-update', { detail: { tenderId } }));
    setTenderNotes(prev => ({ ...prev, [tenderId]: updatedNotes }));

    try {
      await ensureWatchlistEntry(tenderId, { catatan_internal: JSON.stringify(updatedNotes) });
      console.log('[addTenderNote] Note saved successfully');
      showToast('Catatan berhasil ditambahkan');
    } catch (err) {
      console.error('[addTenderNote] Failed to save:', err);
      // Rollback to old notes
      setTenderNotes(prev => ({ ...prev, [tenderId]: oldNotes }));
      showToast('Gagal menyimpan catatan ke database', 'error');
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
    experts: expertsWithRealReviewers,
    loadingTenders, loadingRup, loadingExperts,
    // Derived
    keywordCount, totalPotensi, relevantCount, urgentCount,
    // Keywords
    keywords, setKeywords, addKeyword, removeKeyword, clearKeywords, updateKeyword,
    // Internal state
    internalStatuses, setInternalStatuses, updateTenderStatus,
    tenderClaims, setTenderClaims,
    rupClaims, setRupClaims, updateRupStatus,
    releaseTenderClaim, reassignTenderClaim,
    tenderNotes, setTenderNotes, addTenderNote,
    noteSaved, setNoteSaved,
    assignedPICs, setAssignedPICs, updateTenderPIC,
    expertCVs, setExpertCVs,
    hiddenTenderIds, hiddenRupIds, hideTender, hideRup, deleteImportedRup, reloadHideLists,
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
    historyDraft, setHistoryDraft, addHistory, deleteExpertHistory, updateExpertProject,
  }), [
    sidebarCollapsed, toast, showToast,
    tenders, rupPlans, expertsRaw, expertsWithRealReviewers,
    refetchTenders,
    loadingTenders, loadingRup, loadingExperts,
    keywordCount, totalPotensi, relevantCount, urgentCount,
    keywords, addKeyword, removeKeyword, clearKeywords, updateKeyword,
    internalStatuses, updateTenderStatus, tenderClaims, rupClaims, updateRupStatus, releaseTenderClaim, reassignTenderClaim,
    tenderNotes, addTenderNote, noteSaved, assignedPICs, updateTenderPIC, expertCVs,
    users, addUser, updateUser, deleteUser,
    notifications, coverage, hpsThreshold,
    selectedTenderId, selectedExpertId, selectedRupId,
    selectedTender, selectedExpert, selectedRup,
    newTenderIds, newRupIds, openTender, openRup,
    markTenderOpened, markRupOpened,
    showWinrateDetail, showStageRef, showPotensiChart, showUrgentPanel, showKeywordManager,
    dashboardChartFilter,
    addExpert, updateExpertName, updateExpertProfile, deleteExpert,
    reviewDraft, addReview, historyDraft, addHistory, deleteExpertHistory, updateExpertProject,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

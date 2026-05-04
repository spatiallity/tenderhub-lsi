import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import api from '../services/api';
import supabase from '../services/supabase';
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
  // Track IDs being deleted to prevent auto-refresh from resurrecting them
  const pendingDeleteIdsRef = useRef(new Set());

  // Keywords state
  const [keywords, setKeywords] = useState(DEFAULT_KEYWORDS);

  // Tenders state from API
  const [tendersRaw, setTendersRaw] = useState([]);
  const [rupRaw, setRupRaw] = useState([]);
  // Always start empty — API/Supabase is the single source of truth
  const [expertsRaw, setExpertsRaw] = useState([]);
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

  // ─── Reusable fetch functions ──────────────────────────────────────────────

  const fetchTenders = useCallback(() => {
    api.get('/tender/search', { params: { limit: 200 } })
      .then(res => {
        setTendersRaw(res.data || []);
        const statusMap = {};
        const notesMap = {};
        (res.data || []).forEach(t => {
          t.id = t.kd_tender || t.id;
          let s = t.internalStatus || 'Dipantau';
          if (t.won === true) s = 'Menang';
          else if (s === 'Sudah Diikuti' && t.lost === true) s = 'Kalah';
          // API/Supabase data always wins for cross-user sync
          statusMap[t.id] = s;
          if (t.catatan_internal) {
            try { notesMap[t.id] = JSON.parse(t.catatan_internal); } catch { /* ignore */ }
          }
        });
        // API data is source of truth — replaces localStorage values
        setInternalStatuses(statusMap);
        setTenderNotes(notesMap);
      })
      .catch(() => {
        // Offline fallback: use localStorage as last resort
        setTendersRaw(FALLBACK_TENDERS);
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
        setInternalStatuses(statusMap);
      })
      .finally(() => setLoadingTenders(false));
  }, []);

  const fetchExperts = useCallback(() => {
    api.get('/experts')
      .then(res => {
        const apiExperts = (res.data || []).map(e => ({
          ...e,
          noHp: e.no_hp || '',
          portofolio: e.subporto || [],
          rating: e.rating_avg || 0,
          proyek: e.jumlah_proyek || 0,
          history: (e.projects || []).map(p => ({
            id: p.id, proyek: p.nama_proyek, klien: p.pemberi_kerja, tahun: p.tahun,
            peran: p.peran, nilai: p.nilai_proyek, bersama: p.bersama, status: p.status_proyek
          })),
          reviews: (e.reviews || []).map(r => ({
            id: r.id, reviewer: r.reviewer_nama, rating: r.rating, komentar: r.komentar,
            tanggal: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : ''
          }))
        }));
        setExpertsRaw(prev => {
          // Keep only optimistic entries (temp IDs) that haven't synced yet
          const pendingOnly = prev.filter(e => String(e.id).startsWith('temp-'));
          // Filter out experts that are pending deletion
          const filtered = apiExperts.filter(e => !pendingDeleteIdsRef.current.has(String(e.id)));
          return [...pendingOnly, ...filtered];
        });
      })
      .catch(() => {
        setExpertsRaw(prev => prev.length > 0 ? prev : FALLBACK_EXPERTS);
      })
      .finally(() => setLoadingExperts(false));
  }, []);

  // ─── Initial data load ─────────────────────────────────────────────────────

  useEffect(() => {
    fetchTenders();
    
    // Fallback polling every 5 minutes (Realtime handles instant sync)
    const intervalId = setInterval(() => {
      fetchTenders();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchTenders]);

  useEffect(() => {
    api.get('/rup/search', { params: { limit: 100 } })
      .then(res => setRupRaw(res.data || []))
      .catch(() => {
        setRupRaw(FALLBACK_RUP);
        showToast('API RUP belum tersambung. Dummy RUP lokal dimuat.', 'error');
      })
      .finally(() => setLoadingRup(false));
  }, []); // Empty dependency - only run once on mount

  useEffect(() => {
    if (expertsLoadedRef.current) return;
    expertsLoadedRef.current = true;
    fetchExperts();
    
    // Fallback polling every 5 minutes (Realtime handles instant sync)
    const intervalId = setInterval(() => {
      fetchExperts();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchExperts]);

  // ─── Supabase Realtime: instant cross-user sync ────────────────────────────

  useEffect(() => {
    // Debounce rapid-fire events (e.g. bulk seed inserts)
    let expertTimer = null;
    let tenderTimer = null;
    const debounceRefresh = (fn, timerRef, delay = 1000) => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(fn, delay);
      };
    };
    const expertTimerRef = { current: null };
    const tenderTimerRef = { current: null };

    const debouncedFetchExperts = () => {
      if (expertTimerRef.current) clearTimeout(expertTimerRef.current);
      expertTimerRef.current = setTimeout(() => fetchExperts(), 800);
    };
    const debouncedFetchTenders = () => {
      if (tenderTimerRef.current) clearTimeout(tenderTimerRef.current);
      tenderTimerRef.current = setTimeout(() => fetchTenders(), 800);
    };

    // Subscribe to experts table changes
    const channel = supabase
      .channel('tenderhub-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experts' }, () => {
        console.log('[Realtime] experts changed');
        debouncedFetchExperts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expert_projects' }, () => {
        console.log('[Realtime] expert_projects changed');
        debouncedFetchExperts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expert_reviews' }, () => {
        console.log('[Realtime] expert_reviews changed');
        debouncedFetchExperts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tender_watchlist' }, () => {
        console.log('[Realtime] tender_watchlist changed');
        debouncedFetchTenders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'keywords' }, () => {
        console.log('[Realtime] keywords changed');
        if (typeof fetchGlobalKeywords === 'function') fetchGlobalKeywords();
      })
      .subscribe((status) => {
        console.log('[Realtime] subscription status:', status);
      });

    return () => {
      if (expertTimerRef.current) clearTimeout(expertTimerRef.current);
      if (tenderTimerRef.current) clearTimeout(tenderTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchExperts, fetchTenders]);

  // ─── Refresh on tab focus (sync changes from other users) ─────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-fetch everything when user returns to tab
        fetchTenders();
        fetchExperts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchTenders, fetchExperts]);

  // localStorage is no longer used for experts — API/Supabase is source of truth

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

  const updateTenderStatus = useCallback((tenderId, newStatus) => {
    // OPTIMISTIC: Update UI immediately
    setInternalStatuses(prev => ({ ...prev, [tenderId]: newStatus }));
    showToast(`Status tender diperbarui menjadi ${newStatus}`);
    
    // BACKGROUND: Sync to API
    const tender = tenders.find(t => t.id === tenderId);
    api.post('/watchlist', {
      kd_tender: parseInt(tenderId),
      status_internal: newStatus,
      nama_paket: tender?.nama || tender?.nama_paket,
      hps: tender?.hps
    }).catch(() => {
      showToast("Gagal sinkronisasi status ke server", "warning");
    });
  }, [tenders, showToast]);

  const updateTenderPIC = useCallback((tenderId, userId) => {
    // OPTIMISTIC: Update UI immediately
    setAssignedPICs(prev => ({ ...prev, [tenderId]: userId }));
    showToast('PIC tender berhasil diatur');
    
    // BACKGROUND: Sync to API
    api.post('/watchlist', {
      kd_tender: parseInt(tenderId),
      assigned_expert_ids: userId ? [parseInt(userId)] : []
    }).catch(() => {
      showToast("Gagal sinkronisasi PIC ke server", "warning");
    });
  }, [showToast]);

  const addTenderNote = useCallback((tenderId, noteObj) => {
    // OPTIMISTIC: Update UI immediately
    const updatedNotes = [...(tenderNotes[tenderId] || []), noteObj];
    setTenderNotes(prev => ({ ...prev, [tenderId]: updatedNotes }));
    showToast('Catatan ditambahkan');
    
    // BACKGROUND: Sync to API
    api.post('/watchlist', {
      kd_tender: parseInt(tenderId),
      catatan_internal: JSON.stringify(updatedNotes)
    }).catch(() => {
      showToast('Gagal sinkronisasi catatan ke server', 'warning');
    });
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
  const fetchGlobalKeywords = useCallback(() => {
    api.get('/keyword').then(res => {
      const globalKws = { SDA: [], FLP: [], FITI: [] };
      (res.data || []).forEach(k => {
        if (globalKws[k.subporto]) {
          globalKws[k.subporto].push({ id: k.id, text: k.keyword_text, active: k.is_active, isGlobal: true });
        }
      });
      setKeywords(prev => {
        const merged = { SDA: [], FLP: [], FITI: [] };
        ['SDA', 'FLP', 'FITI'].forEach(p => {
          const locals = prev[p].filter(x => !x.isGlobal && !String(x.id).startsWith('temp-'));
          merged[p] = [...globalKws[p], ...locals];
        });
        return merged;
      });
    }).catch(err => console.error("Failed to fetch global keywords", err));
  }, []);

  useEffect(() => {
    fetchGlobalKeywords();
  }, [fetchGlobalKeywords]);

  const addKeyword = useCallback((portfolio, text, isGlobal = false) => {
    if (!text?.trim()) return;
    const trimText = text.trim();
    if (isGlobal) {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      setKeywords(prev => ({
        ...prev,
        [portfolio]: [...prev[portfolio], { id: tempId, text: trimText, active: true, isGlobal: true }]
      }));
      api.post('/keyword', { keyword_text: trimText, subporto: portfolio, is_active: true })
        .then(() => fetchGlobalKeywords())
        .catch(() => showToast('Gagal menyimpan keyword global', 'error'));
    } else {
      setKeywords(prev => ({
        ...prev,
        [portfolio]: [...prev[portfolio], { id: `local-${Date.now()}`, text: trimText, active: true, isGlobal: false }]
      }));
    }
  }, [showToast, fetchGlobalKeywords]);

  const removeKeyword = useCallback((portfolio, id, isGlobal = false) => {
    if (isGlobal && typeof id === 'number') { // DB IDs are numbers
      api.delete(`/keyword/${id}`)
        .then(() => fetchGlobalKeywords())
        .catch(() => showToast('Gagal menghapus keyword global', 'error'));
    }
    setKeywords(prev => ({ ...prev, [portfolio]: prev[portfolio].filter(k => k.id !== id) }));
  }, [fetchGlobalKeywords, showToast]);

  const clearKeywords = useCallback(() => {
    // Only clear local keywords
    setKeywords(prev => {
      const cleared = { SDA: [], FLP: [], FITI: [] };
      ['SDA', 'FLP', 'FITI'].forEach(p => {
        cleared[p] = prev[p].filter(k => k.isGlobal);
      });
      return cleared;
    });
    showToast('Semua keyword lokal berhasil dibersihkan');
  }, [showToast]);

  const updateKeyword = useCallback((portfolio, id, patch) => {
    setKeywords(prev => ({
      ...prev,
      [portfolio]: prev[portfolio].map(k => k.id === id ? { ...k, ...patch } : k)
    }));
  }, []);

  // Expert actions
  const addExpert = useCallback((draft) => {
    // Handle keahlian - could be array or string
    let keahlianClean = [];
    if (Array.isArray(draft.keahlian)) {
      keahlianClean = draft.keahlian.filter(Boolean).map(s => String(s).trim()).filter(Boolean);
    } else if (typeof draft.keahlian === 'string') {
      keahlianClean = draft.keahlian.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (!draft.nama?.trim()) {
      showToast('Nama tenaga ahli wajib diisi', 'error');
      return false;
    }
    
    if (keahlianClean.length === 0) {
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
      projects: (draft.history || []).map(h => ({
        nama_proyek: h.proyek,
        pemberi_kerja: h.klien || '-',
        tahun: h.tahun || new Date().getFullYear(),
        nilai_proyek: Number(h.nilai || 0),
        peran: h.peran || 'Tenaga Ahli',
        bersama: h.bersama || 'Sucofindo',
        status_proyek: h.status || 'Selesai'
      }))
    };
    
    // OPTIMISTIC: Add to UI immediately with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const optimisticExpert = {
      ...body,
      id: tempId,
      noHp: draft.noHp || '',
      portofolio: body.subporto,
      rating: 0,
      rating_avg: 0,
      proyek: draft.history?.length || 0,
      jumlah_proyek: draft.history?.length || 0,
      history: draft.history || [],
      reviews: [],
      _syncing: true,
    };
    setExpertsRaw(prev => [optimisticExpert, ...prev]);
    showToast('Tenaga ahli berhasil ditambahkan');
    
    // BACKGROUND: Sync to API
    api.post('/experts', body)
      .then(res => {
        const serverExpert = {
          ...res.data,
          noHp: res.data.no_hp || '',
          portofolio: res.data.subporto || [],
          rating: res.data.rating_avg || 0,
          proyek: res.data.jumlah_proyek,
          history: (res.data.projects || []).map(p => ({
            id: p.id, proyek: p.nama_proyek, klien: p.pemberi_kerja, tahun: p.tahun,
            peran: p.peran, nilai: p.nilai_proyek, bersama: p.bersama, status: p.status_proyek
          })),
          reviews: [],
        };
        // Replace temp entry with real server data
        setExpertsRaw(prev => prev.map(e => e.id === tempId ? serverExpert : e));
      })
      .catch(() => {
        // Keep the optimistic entry but mark as local-only
        setExpertsRaw(prev => prev.map(e => e.id === tempId ? { ...e, _syncing: false } : e));
        showToast('Gagal sinkronisasi ke server. Data tersimpan lokal.', 'warning');
      });
    
    return true;
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

  const deleteExpert = useCallback((expertId) => {
    // Track this ID as pending deletion — prevents auto-refresh from bringing it back
    pendingDeleteIdsRef.current.add(String(expertId));
    
    // OPTIMISTIC: Remove from UI immediately
    const removedExpert = expertsRaw.find(e => String(e.id) === String(expertId));
    setExpertsRaw(prev => prev.filter(e => String(e.id) !== String(expertId)));
    setSelectedExpertId(null);
    showToast('Tenaga ahli berhasil dihapus');
    
    // BACKGROUND: Sync to API
    api.delete(`/experts/${expertId}`)
      .then(() => {
        // Delete confirmed — safe to remove from pending set
        pendingDeleteIdsRef.current.delete(String(expertId));
      })
      .catch(() => {
        // Rollback: remove from pending set and re-add to list
        pendingDeleteIdsRef.current.delete(String(expertId));
        if (removedExpert) {
          setExpertsRaw(prev => [...prev, removedExpert]);
          showToast('Gagal menghapus dari server. Data dikembalikan.', 'warning');
        }
      });
  }, [showToast, setSelectedExpertId, expertsRaw]);

  const addReview = useCallback((expertId) => {
    if (!reviewDraft.reviewer?.trim() || !reviewDraft.komentar?.trim()) {
      showToast('Nama reviewer dan komentar wajib diisi', 'error');
      return;
    }
    
    // OPTIMISTIC: Add review to UI immediately
    const tempReview = {
      id: `temp-${Date.now()}`,
      reviewer: reviewDraft.reviewer,
      rating: reviewDraft.rating,
      komentar: reviewDraft.komentar,
      tanggal: new Date().toLocaleDateString('id-ID'),
    };
    setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
      ...e,
      reviews: [...(e.reviews || []), tempReview],
      rating: Number(((e.rating * (e.reviews || []).length + reviewDraft.rating) / ((e.reviews || []).length + 1)).toFixed(1))
    } : e));
    const savedDraft = { ...reviewDraft };
    setReviewDraft({ reviewer: '', rating: 5, komentar: '' });
    showToast('Review berhasil disimpan');
    
    // BACKGROUND: Sync to API
    api.post(`/experts/${expertId}/reviews`, {
      reviewer_nama: savedDraft.reviewer,
      rating: savedDraft.rating,
      komentar: savedDraft.komentar
    }).then(res => {
      // Replace temp ID with server ID
      setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
        ...e,
        reviews: (e.reviews || []).map(r => r.id === tempReview.id ? { ...r, id: res.data.id } : r)
      } : e));
    }).catch(() => {
      showToast('Gagal sinkronisasi review ke server', 'warning');
    });
  }, [reviewDraft, showToast]);

  const addHistory = useCallback((expertId) => {
    if (!historyDraft.proyek?.trim()) {
      showToast('Nama proyek wajib diisi', 'error');
      return;
    }
    
    const apiPayload = {
      nama_proyek: historyDraft.proyek,
      pemberi_kerja: historyDraft.klien || '-',
      tahun: historyDraft.tahun || new Date().getFullYear(),
      nilai_proyek: Number(historyDraft.nilai || 0) * 1000000,
      peran: historyDraft.peran || 'Tenaga Ahli',
      bersama: historyDraft.bersama || 'Sucofindo',
      status_proyek: 'Selesai'
    };
    
    // OPTIMISTIC: Add to UI immediately
    const tempProject = {
      id: `temp-${Date.now()}`,
      proyek: apiPayload.nama_proyek,
      klien: apiPayload.pemberi_kerja,
      tahun: apiPayload.tahun,
      peran: apiPayload.peran,
      nilai: apiPayload.nilai_proyek,
      bersama: apiPayload.bersama,
      status: apiPayload.status_proyek,
    };
    setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
      ...e,
      history: [...(e.history || []), tempProject],
      proyek: (e.proyek || 0) + 1
    } : e));
    setHistoryDraft({ proyek: '', klien: '', tahun: '', nilai: '', peran: '', bersama: 'Sucofindo' });
    showToast('Riwayat berhasil disimpan');
    
    // BACKGROUND: Sync to API
    api.post(`/experts/${expertId}/projects`, apiPayload)
      .then(res => {
        setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
          ...e,
          history: (e.history || []).map(h => h.id === tempProject.id ? { ...h, id: res.data.id } : h)
        } : e));
      })
      .catch(() => {
        showToast('Gagal sinkronisasi riwayat ke server', 'warning');
      });
  }, [historyDraft, showToast]);

  const deleteExpertHistory = useCallback((expertId, projectId) => {
    // OPTIMISTIC: Remove from UI immediately
    const expert = expertsRaw.find(e => String(e.id) === String(expertId));
    const removedProject = expert?.history?.find(h => String(h.id) === String(projectId));
    setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
      ...e,
      history: (e.history || []).filter(h => String(h.id) !== String(projectId)),
      proyek: Math.max((e.proyek || 0) - 1, 0)
    } : e));
    showToast('Riwayat berhasil dihapus');
    
    // BACKGROUND: Sync to API
    api.delete(`/experts/${expertId}/projects/${projectId}`)
      .catch(() => {
        // Rollback on failure
        if (removedProject) {
          setExpertsRaw(prev => prev.map(e => String(e.id) === String(expertId) ? {
            ...e,
            history: [...(e.history || []), removedProject],
            proyek: (e.proyek || 0) + 1
          } : e));
          showToast('Gagal menghapus dari server. Data dikembalikan.', 'warning');
        }
      });
  }, [showToast, expertsRaw]);


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

  // Manual refresh function for users to sync data
  const refreshAllData = useCallback(async () => {
    showToast('Menyinkronkan data...', 'info');
    try {
      await Promise.all([
        fetchTenders(),
        fetchExperts(),
      ]);
      showToast('Data berhasil disinkronkan');
    } catch (error) {
      showToast('Gagal menyinkronkan data', 'error');
    }
  }, [fetchTenders, fetchExperts, showToast]);

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
    // Data refresh
    refreshAllData,
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
    refreshAllData,
    dashboardChartFilter,
    addExpert, updateExpertName, updateExpertProfile, deleteExpert, deleteExpertHistory,
    reviewDraft, addReview, historyDraft, addHistory,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

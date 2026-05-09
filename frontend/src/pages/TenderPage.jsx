import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, FileSpreadsheet, MapPin, ChevronRight, Filter, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Badge, CountdownBadge, PageTitle, Card, Btn, ClaimBadge } from '../components/UI/index';
import { portfolioColor, internalStatusColor, PROVINCES, INTERNAL_STATUS_OPTIONS } from '../utils/constants';
import { unitKerjaLabel } from '../utils/unitKerja';
import { formatRupiah, activeKeywordCount, exportTendersExcel } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';
import { useWatchlistRealtime } from '../hooks/useWatchlistRealtime';

const stageBadgeClass = {
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

function StatusCell({ tender, committedStatus, updateTenderStatus, showToast, isGuest, claim, canEdit, viewerOwns }) {
  const [localStatus, setLocalStatus] = useState(committedStatus || 'Dipantau');
  const [isSaving, setIsSaving] = useState(false);

  // Sync if parent refreshes
  useEffect(() => {
    setLocalStatus(committedStatus || 'Dipantau');
  }, [committedStatus]);

  const isChanged = localStatus !== (committedStatus || 'Dipantau');
  const lockedByClaim = !canEdit && claim?.unit_kerja;

  const stageName = (tender.currentStageName || '').toLowerCase();
  // "Menang" only after Pengumuman Pemenang stage is reached (or anything after it).
  const canBeWon = tender.currentStageName && (
    stageName.includes('pengumuman pemenang') ||
    stageName.includes('masa sanggah') ||
    stageName.includes('penunjukan') ||
    stageName.includes('kontrak')
  );

  const handleSave = async (e) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateTenderStatus(tender.id, localStatus);
      showToast('Status tender berhasil diperbarui');
    } catch {
      showToast('Gagal menyimpan perubahan. Silakan coba lagi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Guests + non-owners can only view (read-only badge).
  if (isGuest || lockedByClaim) {
    return (
      <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
        <span className={`w-full rounded-lg border px-2 py-1.5 text-[11px] font-bold text-center ${
          {
            'Dipantau':     'bg-slate-50 text-slate-700 border-slate-200',
            'Akan Diikuti': 'bg-blue-50 text-blue-700 border-blue-200',
            'Sudah Diikuti':'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Menang':       'bg-green-50 text-green-700 border-green-200',
            'Kalah':        'bg-red-50 text-red-700 border-red-200',
            'Tidak Relevan':'bg-amber-50 text-amber-700 border-amber-200',
          }[localStatus] || 'bg-slate-50 text-slate-700 border-slate-200'
        }`}>
          {localStatus}
        </span>
        {lockedByClaim && (
          <ClaimBadge claim={claim} viewerOwns={false} readOnly size="xs" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
      <select
        value={localStatus}
        onChange={e => setLocalStatus(e.target.value)}
        disabled={isSaving}
        className={`w-full rounded-lg border px-2 py-1.5 text-[11px] font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-200 transition-colors disabled:opacity-50 ${
          {
            'Dipantau':     'bg-slate-50 text-slate-700 border-slate-200',
            'Akan Diikuti': 'bg-blue-50 text-blue-700 border-blue-200',
            'Sudah Diikuti':'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Menang':       'bg-green-50 text-green-700 border-green-200',
            'Kalah':        'bg-red-50 text-red-700 border-red-200',
            'Tidak Relevan':'bg-amber-50 text-amber-700 border-amber-200',
          }[localStatus] || 'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        {(INTERNAL_STATUS_OPTIONS || ['Dipantau', 'Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah', 'Tidak Relevan']).map(opt => {
          const isDisabled = opt === 'Menang' && !canBeWon;
          return (
            <option key={opt} value={opt} disabled={isDisabled}>
              {opt}{isDisabled ? ' (Belum Pengumuman)' : ''}
            </option>
          );
        })}
      </select>
      {isChanged && (
        <Btn
          className="primary w-full justify-center"
          style={{ fontSize: '10px', padding: '3px 8px' }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Btn>
      )}
      {/* Owner badge — always shown so user knows their own claim is active. */}
      <ClaimBadge claim={claim} viewerOwns={!!viewerOwns} size="xs" />
    </div>
  );
}

export default function TenderPage() {
  // Subscribe to realtime watchlist changes
  useWatchlistRealtime();

  const { isGuest, isAdmin, unitKerja, canEditClaim } = useAuth();
  const {
    tenders, keywords, loadingTenders,
    addKeyword, removeKeyword,
    internalStatuses, setInternalStatuses, updateTenderStatus, setSelectedTenderId,
    hpsThreshold,
    setShowKeywordManager,
    hideTender,
    newTenderIds,
    dashboardChartFilter,
    setDashboardChartFilter,
    showToast,
    tenderClaims,
    releaseTenderClaim,
  } = useAppContext();

  const [portfolioFilter, setPortfolioFilter] = useState('Semua');
  const [levelFilter, setLevelFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('');
  const [instansiFilter, setInstansiFilter] = useState('Semua');
  const [provinsiFilter, setProvinsiFilter] = useState('Semua');
  const [hpsMin, setHpsMin] = useState('');
  const [hpsMax, setHpsMax] = useState('');
  const [tenderSearch, setTenderSearch] = useState('');
  const [keywordOnly, setKeywordOnly] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [showIrrelevant, setShowIrrelevant] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const renderSortTh = (k, label, className = '') => (
    <th
      key={k}
      className={`bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-3 border-b border-slate-200 whitespace-nowrap cursor-pointer hover:text-slate-700 hover:bg-slate-100 transition-colors select-none text-center ${className}`}
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center justify-center gap-1">
        {label}
        {sortKey === k ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={10} className="opacity-30" />}
      </span>
    </th>
  );

  // Debounce search input for better performance
  const debouncedSearch = useDebounce(tenderSearch, 300);

  const keywordCount = useMemo(() => activeKeywordCount(keywords), [keywords]);
  const newTenderSet = useMemo(() => new Set((newTenderIds || []).map(String)), [newTenderIds]);

  const tableScrollRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    // Default behavior: when there are active keywords, show only matched tenders.
    setKeywordOnly(keywordCount > 0);
  }, [keywordCount]);

  const statusOptions = useMemo(() =>
    Array.from(new Set(tenders.map(t => t.currentStageName))).sort(),
    [tenders]
  );

  const instansiOptions = useMemo(() =>
    Array.from(new Set(tenders.map(t => t.instansi).filter(Boolean))).sort(),
    [tenders]
  );

  useEffect(() => {
    if (!dashboardChartFilter) return;

    // Reset filters before applying new mode
    setPortfolioFilter('Semua');
    setInstansiFilter('Semua');
    setLevelFilter('Semua');
    setStatusFilter('');
    setTenderSearch('');
    setKeywordOnly(false);
    setUrgentOnly(false);

    if (dashboardChartFilter.mode === 'portfolio' && dashboardChartFilter.portfolio) {
      setPortfolioFilter(dashboardChartFilter.portfolio);
    } else if (dashboardChartFilter.mode === 'urgent') {
      setUrgentOnly(true);
    } else if (dashboardChartFilter.mode === 'relevant') {
      setKeywordOnly(true);
    } else if (dashboardChartFilter.mode === 'instansi' && dashboardChartFilter.instansi) {
      setInstansiFilter(dashboardChartFilter.instansi);
    }
  }, [dashboardChartFilter]);
  const filteredTenders = useMemo(() => {
    let result = tenders.filter(t => {
      const isIrrelevant = t.internalStatus === 'Tidak Relevan';
      if (showIrrelevant) {
        if (!isIrrelevant) return false;
      } else {
        if (isIrrelevant) return false;
      }

      if (urgentOnly && (t.daysLeft > 7 || t.daysLeft < 0)) return false;
      if (keywordOnly && (!t.matched || t.matched.length === 0)) return false;
      if (debouncedSearch.trim() && !`${t.nama} ${t.instansi} ${t.provinsi}`.toLowerCase().includes(debouncedSearch.trim().toLowerCase())) return false;
      if (instansiFilter !== 'Semua' && t.instansi !== instansiFilter) return false;
      if (portfolioFilter !== 'Semua' && t.recommendation !== portfolioFilter) return false;
      if (levelFilter !== 'Semua' && t.level !== levelFilter) return false;
      if (statusFilter && t.currentStageName !== statusFilter) return false;
      if (provinsiFilter !== 'Semua' && t.provinsi !== provinsiFilter) return false;
      if (hpsMin && (t.hps || 0) < Number(hpsMin) * 1000000) return false;
      if (hpsMax && (t.hps || 0) > Number(hpsMax) * 1000000) return false;
      if ((t.hps || 0) < Number(hpsThreshold || 0) * 1000000) return false;
      return true;
    });
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        let va, vb;
        switch (sortKey) {
          case 'kd_tender': va = String(a.kd_tender || ''); vb = String(b.kd_tender || ''); break;
          case 'nama': va = (a.nama || '').toLowerCase(); vb = (b.nama || '').toLowerCase(); break;
          case 'instansi': va = (a.instansi || '').toLowerCase(); vb = (b.instansi || '').toLowerCase(); break;
          case 'hps': va = a.hps || 0; vb = b.hps || 0; break;
          case 'stage': va = (a.currentStageName || '').toLowerCase(); vb = (b.currentStageName || '').toLowerCase(); break;
          case 'deadline': va = a.daysLeft ?? 999; vb = b.daysLeft ?? 999; break;
          case 'metode': va = (a.mtd_pemilihan || a.metode || '').toLowerCase(); vb = (b.mtd_pemilihan || b.metode || '').toLowerCase(); break;
          case 'status': va = (internalStatuses[a.id] || 'Dipantau').toLowerCase(); vb = (internalStatuses[b.id] || 'Dipantau').toLowerCase(); break;
          default: return 0;
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    return result;
  }, [tenders, portfolioFilter, levelFilter, statusFilter, instansiFilter, provinsiFilter, hpsMin, hpsMax, hpsThreshold, keywordOnly, urgentOnly, debouncedSearch, sortKey, sortDir, internalStatuses, showIrrelevant]);

  const clearAll = () => {
    setPortfolioFilter('Semua'); setLevelFilter('Semua'); setStatusFilter('');
    setInstansiFilter('Semua'); setProvinsiFilter('Semua'); setHpsMin(''); setHpsMax(''); setTenderSearch('');
    setShowIrrelevant(false); setKeywordOnly(false); setUrgentOnly(false);
    setDashboardChartFilter({ mode: 'all', portfolio: null });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Tender Intelligence"
        subtitle={`${filteredTenders.length} tender tampil dari ${tenders.length} tender aktif. Filter dan keyword bekerja real-time.`}
        right={
          <div className="flex gap-2 flex-wrap items-center">
            {filteredTenders.length !== tenders.length && (
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-bold text-blue-700">
                  {filteredTenders.length} hasil
                </span>
              </div>
            )}
            <Btn className="ghost" onClick={() => exportTendersExcel(filteredTenders)}><FileSpreadsheet size={16} />Export Excel</Btn>

          </div>
        }
      />

      {/* Panel Filter */}
      <Card>
        <div className="flex items-center gap-2 mb-3.5">
          <Filter size={16} className="text-blue-600" />
          <h2 className="text-base font-extrabold tracking-tight">Filter Tender</h2>
          <div className="ml-auto flex items-center gap-2">
            <Btn className="ghost small" onClick={clearAll}><X size={14} />Reset Filter</Btn>
            <Btn className="ghost small" onClick={() => setShowKeywordManager(true)}>Kelola Keyword</Btn>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              placeholder="Cari nama paket, instansi, atau provinsi..." 
              value={tenderSearch}
              onChange={e => setTenderSearch(e.target.value)} 
              className="w-full pl-8 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl flex-wrap">
            {['Semua', 'FLP', 'SDA', 'FITI'].map(p => (
              <button 
                key={p} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-shadow ${portfolioFilter === p ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-transparent text-slate-500 hover:text-slate-800'}`} 
                onClick={() => setPortfolioFilter(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl flex-wrap">
            {['Semua', 'K/L', 'Provinsi', 'Kab/Kota'].map(l => (
              <button 
                key={l} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-shadow ${levelFilter === l ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-transparent text-slate-500 hover:text-slate-800'}`} 
                onClick={() => setLevelFilter(l)}
              >
                {l}
              </button>
            ))}
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option value="">Semua Status Tender</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={instansiFilter}
            onChange={e => setInstansiFilter(e.target.value)}
            className="max-w-[240px] border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option>Semua</option>
            {instansiOptions.map(i => <option key={i}>{i}</option>)}
          </select>
          <input type="number" placeholder="HPS min (jt)" value={hpsMin} onChange={e => setHpsMin(e.target.value)} className="w-[120px] border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
          <input type="number" placeholder="HPS max (jt)" value={hpsMax} onChange={e => setHpsMax(e.target.value)} className="w-[120px] border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
          <select 
            value={provinsiFilter} 
            onChange={e => setProvinsiFilter(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option>Semua</option>
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
            <input
              id="keywordOnly"
              type="checkbox"
              checked={keywordOnly}
              onChange={e => setKeywordOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="keywordOnly" className="text-xs font-extrabold text-slate-700 cursor-pointer">
              Hanya tender sesuai keyword
            </label>
            <span className="text-[11px] text-slate-500">
              ({keywordCount} aktif)
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-red-50">
            <input
              id="urgentOnly"
              type="checkbox"
              checked={urgentOnly}
              onChange={e => setUrgentOnly(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="urgentOnly" className="text-xs font-extrabold text-red-700 cursor-pointer">
              Deadline {'<='} 7 Hari
            </label>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
            <input
              id="showIrrelevant"
              type="checkbox"
              checked={showIrrelevant}
              onChange={e => setShowIrrelevant(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="showIrrelevant" className="text-xs font-extrabold text-slate-700 cursor-pointer">
              Tampilkan "Tidak Relevan"
            </label>
          </div>
        </div>
      </Card>

      {/* Tabel */}
      <Card className="!p-0">
        {loadingTenders ? (
          <div className="p-10 text-center text-slate-500">Memuat data tender...</div>
        ) : (
          <>
            <div
              ref={tableScrollRef}
              className="overflow-x-auto pb-2 max-w-full"
            >
              <table ref={tableRef} className="min-w-[1180px] xl:min-w-[1320px] w-full table-fixed text-left border-collapse text-[12px]">
              <colgroup>
                <col className="w-[68px] xl:w-[78px]" />     {/* Kode Tender — narrow */}
                <col className="w-[230px] xl:w-[260px]" />   {/* Nama Paket */}
                <col className="hidden xl:table-column xl:w-[140px]" /> {/* Instansi/Satker — narrower */}
                <col className="hidden" />                    {/* Jenis KLPD (hidden) */}
                <col className="w-[110px] xl:w-[120px]" />   {/* Pagu/HPS */}
                <col className="hidden" />                    {/* Sub-Portofolio (hidden) */}
                <col className="hidden" />                    {/* Sumber Dana (hidden) */}
                <col className="w-[140px] xl:w-[160px]" />   {/* Status Tahap */}
                <col className="w-[120px] xl:w-[136px]" />   {/* Deadline */}
                <col className="w-[108px] xl:w-[120px]" />   {/* Status Internal */}
                <col className="w-[80px] xl:w-[90px]" />     {/* Aksi */}
              </colgroup>
              <thead>
                <tr>
                  {renderSortTh('kd_tender', 'Kode Tender')}
                  {renderSortTh('nama', 'Nama Paket Pekerjaan')}
                  {renderSortTh('instansi', 'Instansi / Satker', 'hidden xl:table-cell')}
                  <th className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-3 border-b border-slate-200 hidden whitespace-nowrap text-center">Jenis KLPD</th>
                  {renderSortTh('hps', 'Pagu / HPS')}
                  <th className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-3 border-b border-slate-200 hidden whitespace-nowrap text-center">Sub-Portofolio</th>
                  <th className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-3 border-b border-slate-200 hidden whitespace-nowrap text-center">Sumber Dana</th>
                  {renderSortTh('stage', 'Status Tahap Tender')}
                  {renderSortTh('deadline', 'Deadline')}
                  {renderSortTh('status', 'Status Internal')}
                  <th className="bg-slate-50 border-b border-slate-200 sticky right-0 z-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenders.map(t => {
                  const isNew = newTenderSet.has(String(t.id));
                  return (
                    <tr key={t.id} className={`transition-colors ${isNew ? 'bg-amber-50/80 hover:bg-amber-100/70 shadow-[inset_4px_0_0_#f59e0b]' : 'hover:bg-slate-50'}`}>
                      <td className="px-3 py-3 align-top">
                        <div className="font-mono text-[11px] font-bold text-slate-700 break-all">{t.kd_tender || '-'}</div>
                        <div className="text-slate-500 text-[10px] mt-1">TA {t.tahun_anggaran}</div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <button
                          onClick={() => setSelectedTenderId(t.id)}
                          className="font-extrabold leading-snug line-clamp-2 text-left hover:text-blue-700 transition-colors"
                          title={`Klik untuk lihat detail: ${t.nama}`}
                        >
                          {t.nama}
                          {isNew && <Badge color="amber" className="ml-1.5">Baru</Badge>}
                        </button>
                        <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-1.5 min-w-0">
                          <MapPin size={12} className="shrink-0" /><span className="truncate">{t.lokasi_pekerjaan || t.provinsi}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top hidden xl:table-cell">
                        <div className="text-xs font-bold text-slate-900 line-clamp-2">{t.instansi}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 truncate">{t.nama_satker}</div>
                      </td>
                      <td className="px-3 py-3 align-top hidden">
                        <Badge color={t.jenis_klpd === 'KEMENTERIAN' ? 'blue' : t.jenis_klpd === 'LEMBAGA' ? 'indigo' : t.jenis_klpd?.includes('PROVINSI') ? 'teal' : 'gray'}>
                          {t.level}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap align-top">
                        <div className="font-extrabold text-[12px]">{formatRupiah(t.pagu)}</div>
                        <div className="text-slate-500 text-[11px]">HPS: {formatRupiah(t.hps)}</div>
                      </td>
                      <td className="px-3 py-3 align-top hidden"><Badge color={portfolioColor[t.recommendation]}>{t.recommendation}</Badge></td>
                      <td className="px-3 py-3 align-top hidden">
                        <Badge color={t.sumber_dana === 'APBN' ? 'blue' : t.sumber_dana === 'APBD' ? 'teal' : 'amber'}>
                          {t.sumber_dana}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-tight ${stageBadgeClass[t.currentStageColor] || stageBadgeClass.gray}`}>
                            <span className="min-w-0 whitespace-normal break-words line-clamp-2">
                              {t.currentStageName}
                            </span>
                          </span>
                          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(t.currentStage / t.totalStages) * 100}%` }} />
                          </div>
                          <span className="text-slate-500 text-[11px]">Tahap {t.currentStage}/{t.totalStages}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <CountdownBadge dateStr={t.deadlineStage} days={t.daysLeft} expired={t.deadlinePassed} />
                        <div className="text-[10px] text-slate-500 mt-1">
                          Tahap {t.deadlineRefStageNo}: {t.deadlineRefStageName}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {(() => {
                          const claim = tenderClaims[t.id] || null;
                          const viewerOwns = claim?.unit_kerja && claim.unit_kerja === unitKerja;
                          const canEdit = canEditClaim(claim?.unit_kerja);
                          return (
                            <StatusCell
                              tender={t}
                              committedStatus={internalStatuses[t.id]}
                              updateTenderStatus={updateTenderStatus}
                              showToast={showToast}
                              isGuest={isGuest}
                              claim={claim}
                              canEdit={canEdit}
                              viewerOwns={viewerOwns}
                            />
                          );
                        })()}
                      </td>
                      <td className={`px-3 py-3 align-top sticky right-0 backdrop-blur-sm ${isNew ? 'bg-amber-50/95' : 'bg-white/95'}`}>
                        <div className="flex items-center gap-1">
                          <Btn className="ghost small" onClick={() => setSelectedTenderId(t.id)}>
                            Detail<ChevronRight size={14} />
                          </Btn>
                          {isAdmin && tenderClaims[t.id] && (
                            <button
                              type="button"
                              title={`Lepas claim cabang ${unitKerjaLabel(tenderClaims[t.id].unit_kerja)}`}
                              onClick={async () => {
                                if (!confirm(`Lepas claim tender "${t.nama}" dari ${unitKerjaLabel(tenderClaims[t.id].unit_kerja)}?\nTender akan kembali tersedia untuk semua cabang.`)) return;
                                await releaseTenderClaim(t.id);
                              }}
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 text-[10px] font-bold"
                            >
                              Lepas
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              title="Hapus tender (admin)"
                              onClick={async () => {
                                const kd = t.kd_tender || t.id;
                                if (!confirm(`Hapus tender ${t.nama}?\nIni akan menyembunyikan tender ini dari semua user.`)) return;
                                try { await hideTender(kd, 'admin delete'); }
                                catch (e) { alert(`Gagal hapus: ${e.message || e}`); }
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTenders.length === 0 && (
              <div className="p-7 text-center text-slate-500">
                Tidak ada tender yang cocok dengan filter saat ini.
              </div>
            )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

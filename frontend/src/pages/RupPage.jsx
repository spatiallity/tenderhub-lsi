import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, ChevronRight, Filter, X, FileSpreadsheet, Upload, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Badge, PageTitle, Card, Btn, ClaimBadge } from '../components/UI/index';
import { portfolioColor, PROVINCES, INTERNAL_STATUS_OPTIONS } from '../utils/constants';
import { unitKerjaLabel } from '../utils/unitKerja';
import { formatRupiah, activeKeywordCount, exportRupExcel, formatMonthYear } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';
import supabase from '../services/supabase';

// Parse SIRUP "Cari Paket Penyedia" xlsx (header at row 3, 1-indexed).
function parseSirupXlsx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        // Find header row by looking for 'Paket' + 'ID' tokens.
        let headerIdx = rows.findIndex(r => Array.isArray(r) && r.includes('Paket') && r.includes('ID'));
        if (headerIdx < 0) headerIdx = 2; // SIRUP default
        const headers = rows[headerIdx].map(h => String(h || '').trim());
        const ix = (name) => headers.indexOf(name);
        const ixPaket = ix('Paket');
        const ixPagu = ix('Pagu (Rp)');
        const ixJenis = ix('Jenis Pengadaan');
        const ixMetode = ix('Metode');
        const ixPemilihan = ix('Pemilihan');
        const ixKlpd = ix('K/L/PD');
        const ixSatker = ix('Satuan Kerja');
        const ixLokasi = ix('Lokasi');
        const ixId = ix('ID');
        if (ixId < 0 || ixPaket < 0) {
          reject(new Error(`Header tidak dikenali. Pastikan format SIRUP "Cari Paket Penyedia". Header terdeteksi: ${headers.join(' | ')}`));
          return;
        }
        const out = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || !r[ixId]) continue;
          const paketRaw = String(r[ixPaket] || '').trim();
          // SIRUP "Paket" typically: "<kode-internal> <nama paket>". Take first whitespace-token as
          // kode-internal hint, rest as nama.
          const firstSpace = paketRaw.indexOf(' ');
          const namaPaket = firstSpace > 0 ? paketRaw.slice(firstSpace + 1).trim() : paketRaw;
          const lokasi = String(r[ixLokasi] || '').trim();
          const [provinsi, kabupaten] = lokasi.split(',').map(s => s.trim());
          out.push({
            kd_rup: String(r[ixId]).trim(),
            nama_paket: namaPaket || paketRaw,
            pagu: Number(r[ixPagu]) || 0,
            jenis_pengadaan: String(r[ixJenis] || '').trim(),
            metode_pengadaan: String(r[ixMetode] || '').trim(),
            tgl_awal_pemilihan: String(r[ixPemilihan] || '').trim(),
            nama_klpd: String(r[ixKlpd] || '').trim(),
            nama_satker: String(r[ixSatker] || '').trim(),
            lokasi,
            provinsi: provinsi || null,
            kabupaten: kabupaten || null,
          });
        }
        resolve(out);
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// SIRUP "Pemilihan" cell looks like "January 2026". Convert to ISO 1st-of-month.
const MONTHS_EN = { january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
const MONTHS_ID = { januari:0,februari:1,maret:2,april:3,mei:4,juni:5,juli:6,agustus:7,september:8,oktober:9,november:10,desember:11 };

function parsePemilihan(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  // Already ISO
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return s.slice(0, 10);
  // "<Month> <YYYY>" — English / Indonesian.
  const m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const monKey = m[1].toLowerCase();
    const idx = MONTHS_EN[monKey] ?? MONTHS_ID[monKey];
    if (idx !== undefined) {
      const yr = m[2];
      const mm = String(idx + 1).padStart(2, '0');
      return `${yr}-${mm}-01`;
    }
  }
  // Fallback: let Date parse, snap to YYYY-MM-01.
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yr = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mm}-01`;
  }
  return null;
}

function daysUntil(isoDate) {
  if (!isoDate) return null;
  const d = new Date(`${isoDate}T00:00:00+07:00`);
  if (isNaN(d.getTime())) return null;
  return Math.ceil((d - new Date()) / 86400000);
}

// Map a rup_imports row -> shape compatible with rupList consumed by the table.
function importedToRup(row) {
  const tgl = parsePemilihan(row.tgl_awal_pemilihan);
  const days = daysUntil(tgl);
  return {
    id: `imp-${row.kd_rup}`,
    kd_rup: row.kd_rup,
    nama_paket: row.nama_paket,
    nama_satker: row.nama_satker,
    nama_klpd: row.nama_klpd,
    jenis_pengadaan: row.jenis_pengadaan,
    metode_pengadaan: row.metode_pengadaan,
    tgl_awal_pemilihan: tgl,                 // ISO yyyy-mm-dd or null
    pagu: row.pagu,
    provinsi: row.provinsi,
    kabupaten: row.kabupaten,
    recommendation: 'Lainnya',
    matched: [],
    daysUntilSelection: days ?? 0,
    tipe_paket: 'Imported',
    jenis_klpd: row.nama_klpd?.toUpperCase().includes('KEMENTERIAN')
      ? 'KEMENTERIAN'
      : row.nama_klpd?.toUpperCase().includes('LEMBAGA')
      ? 'LEMBAGA'
      : 'PEMDA',
    _imported: true,
  };
}

// Inline RUP status cell: select + Save when changed; locked badge for non-owners.
function RupStatusCell({ rup, claim, canEdit, viewerOwns, isGuest, updateRupStatus, showToast }) {
  const initial = claim?.status_internal || 'Dipantau';
  const [localStatus, setLocalStatus] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setLocalStatus(initial); }, [initial]);

  const lockedByClaim = !canEdit && claim?.unit_kerja;
  const isChanged = localStatus !== initial;

  const handleSave = async (e) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateRupStatus(rup.id, localStatus, rup);
    } finally { setIsSaving(false); }
  };

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
        }`}>{localStatus}</span>
        {lockedByClaim && <ClaimBadge claim={claim} viewerOwns={false} readOnly size="xs" />}
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
        {INTERNAL_STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {isChanged && (
        <Btn className="primary w-full justify-center" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </Btn>
      )}
      <ClaimBadge claim={claim} viewerOwns={!!viewerOwns} size="xs" />
    </div>
  );
}

export default function RupPage() {
  const { rupList, keywords, setSelectedRupId, loadingRup, newRupIds, setShowKeywordManager, internalStatuses, hideRup, deleteImportedRup, rupClaims, updateRupStatus, showToast } = useAppContext();
  const { isAdmin, isGuest, unitKerja, canEditClaim } = useAuth();
  const [importedRows, setImportedRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const reloadImports = async () => {
    const { data, error } = await supabase
      .from('rup_imports')
      .select('*')
      .order('imported_at', { ascending: false });
    if (error) { console.warn('[RUP imports] load failed', error); return; }
    setImportedRows(data || []);
  };

  useEffect(() => { reloadImports(); }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const rows = await parseSirupXlsx(file);
      if (rows.length === 0) { alert('Tidak ada baris valid pada file.'); return; }
      // Upsert by kd_rup. Supabase upsert needs unique key; rup_imports has kd_rup UNIQUE.
      const { error } = await supabase
        .from('rup_imports')
        .upsert(rows, { onConflict: 'kd_rup' });
      if (error) {
        alert(`Gagal import: ${error.message}`);
        return;
      }
      alert(`Berhasil import ${rows.length} paket RUP.`);
      reloadImports();
    } catch (err) {
      console.error('[RUP import]', err);
      alert(`Gagal parse file: ${err.message || err}`);
    } finally {
      setImporting(false);
    }
  };

  // Merge: INAPROC rupList wins on kd_rup conflict; imports fill the rest.
  const mergedRup = useMemo(() => {
    const inaprocKeys = new Set((rupList || []).map(r => String(r.kd_rup)));
    const onlyImports = importedRows
      .filter(r => !inaprocKeys.has(String(r.kd_rup)))
      .map(importedToRup);
    return [...(rupList || []), ...onlyImports];
  }, [rupList, importedRows]);

  const [portfolioFilter, setPortfolioFilter] = useState('Semua');
  const [levelFilter, setLevelFilter] = useState('Semua');
  const [provinsiFilter, setProvinsiFilter] = useState('Semua');
  const [rupSearch, setRupSearch] = useState('');
  const [keywordOnly, setKeywordOnly] = useState(true);
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
      className={`bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-3 border-b border-slate-200 whitespace-nowrap cursor-pointer hover:text-slate-700 hover:bg-slate-100 transition-colors select-none text-center ${className}`}
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center justify-center gap-1">
        {label}
        {sortKey === k ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={10} className="opacity-30" />}
      </span>
    </th>
  );

  // Debounce search input for better performance
  const debouncedSearch = useDebounce(rupSearch, 300);

  const keywordCount = useMemo(() => activeKeywordCount(keywords), [keywords]);
  const newRupSet = useMemo(() => new Set((newRupIds || []).map(String)), [newRupIds]);

  const tableScrollRef = useRef(null);
  const tableRef = useRef(null);

  const filteredRup = useMemo(() => {
    let result = (mergedRup || []).filter(r => {
      const isIrrelevant = internalStatuses && internalStatuses[r.id] === 'Tidak Relevan';
      if (showIrrelevant) {
        if (!isIrrelevant) return false;
      } else {
        if (isIrrelevant) return false;
      }

      if (keywordOnly && keywordCount > 0 && (!r.matched || r.matched.length === 0)) return false;
      if (debouncedSearch.trim() && !`${r.nama_paket} ${r.nama_satker} ${r.provinsi} ${r.kabupaten}`.toLowerCase().includes(debouncedSearch.trim().toLowerCase())) return false;
      if (portfolioFilter !== 'Semua' && r.recommendation !== portfolioFilter) return false;
      if (levelFilter === 'PEMDA' && ['KEMENTERIAN', 'LEMBAGA'].includes(r.jenis_klpd)) return false;
      if (!['Semua', 'PEMDA'].includes(levelFilter) && r.jenis_klpd !== levelFilter) return false;
      if (provinsiFilter !== 'Semua' && r.provinsi !== provinsiFilter) return false;
      return true;
    });
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        let va, vb;
        switch (sortKey) {
          case 'kd_rup': va = String(a.kd_rup || ''); vb = String(b.kd_rup || ''); break;
          case 'nama': va = (a.nama_paket || '').toLowerCase(); vb = (b.nama_paket || '').toLowerCase(); break;
          case 'satker': va = (a.nama_satker || '').toLowerCase(); vb = (b.nama_satker || '').toLowerCase(); break;
          case 'jenis': va = (a.jenis_pengadaan || '').toLowerCase(); vb = (b.jenis_pengadaan || '').toLowerCase(); break;
          case 'jadwal': va = a.daysUntilSelection ?? 999; vb = b.daysUntilSelection ?? 999; break;
          case 'pagu': va = a.pagu || 0; vb = b.pagu || 0; break;
          case 'portfolio': va = (a.recommendation || '').toLowerCase(); vb = (b.recommendation || '').toLowerCase(); break;
          case 'status_internal': {
            // Order by ranked status priority then alpha.
            const order = { 'Menang': 1, 'Sudah Diikuti': 2, 'Akan Diikuti': 3, 'Dipantau': 4, 'Kalah': 5, 'Tidak Relevan': 6 };
            va = order[rupClaims[String(a.kd_rup)]?.status_internal] || 99;
            vb = order[rupClaims[String(b.kd_rup)]?.status_internal] || 99;
            break;
          }
          default: return 0;
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    return result;
  }, [mergedRup, portfolioFilter, levelFilter, provinsiFilter, debouncedSearch, keywordCount, keywordOnly, sortKey, sortDir, showIrrelevant, internalStatuses, rupClaims]);

  const clearAll = () => {
    setPortfolioFilter('Semua');
    setLevelFilter('Semua');
    setProvinsiFilter('Semua');
    setRupSearch('');
    setShowIrrelevant(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="RUP Pipeline"
        subtitle={`${filteredRup.length} paket RUP tampil dari ${mergedRup.length} paket (INAPROC ${rupList?.length || 0} + impor ${importedRows.length}). INAPROC menang saat bentrok kode RUP.`}
        right={
          <div className="flex gap-2 flex-wrap items-center">
            {filteredRup.length !== mergedRup.length && (
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-bold text-blue-700">
                  {filteredRup.length} hasil
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
            />
            <Btn className="ghost" disabled={importing} onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />{importing ? 'Mengimpor…' : 'Import Excel SIRUP'}
            </Btn>
            <Btn className="ghost" onClick={() => exportRupExcel(filteredRup)}><FileSpreadsheet size={16} />Export Excel</Btn>
          </div>
        }
      />

      <Card>
        <div className="flex items-center gap-2 mb-3.5">
          <Filter size={16} className="text-blue-600" />
          <h2 className="text-base font-extrabold tracking-tight">Filter RUP</h2>
          <div className="ml-auto flex items-center gap-2">
            <Btn className="ghost small" onClick={clearAll}><X size={14} />Reset Filter</Btn>
            <Btn className="ghost small" onClick={() => setShowKeywordManager(true)}>Kelola Keyword</Btn>
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              placeholder="Cari nama paket, instansi, atau daerah..." 
              value={rupSearch}
              onChange={e => setRupSearch(e.target.value)} 
              className="w-full pl-8 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl flex-wrap">
            {['Semua', 'FLP', 'SDA', 'FITI'].map(p => (
              <button key={p} className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-shadow ${portfolioFilter === p ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => setPortfolioFilter(p)}>{p}</button>
            ))}
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl flex-wrap">
            {['Semua', 'KEMENTERIAN', 'LEMBAGA', 'PEMDA'].map(l => (
              <button key={l} className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-shadow ${levelFilter === l ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => setLevelFilter(l)}>{l}</button>
            ))}
          </div>
          <select value={provinsiFilter} onChange={e => setProvinsiFilter(e.target.value)} className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none">
            <option>Semua</option>
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
            <input
              id="rupKeywordOnly"
              type="checkbox"
              checked={keywordOnly}
              onChange={e => setKeywordOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="rupKeywordOnly" className="text-xs font-extrabold text-slate-700 cursor-pointer">
              Hanya RUP sesuai keyword
            </label>
            <span className="text-[11px] text-slate-500">
              ({keywordCount} aktif)
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50">
            <input
              id="rupShowIrrelevant"
              type="checkbox"
              checked={showIrrelevant}
              onChange={e => setShowIrrelevant(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="rupShowIrrelevant" className="text-xs font-extrabold text-slate-700 cursor-pointer">
              Tampilkan "Tidak Relevan"
            </label>
          </div>
        </div>
      </Card>

      <Card className="!p-0">
        {loadingRup ? (
          <div className="p-10 text-center text-slate-500">Memuat data RUP...</div>
        ) : (
          <>
            <div
              ref={tableScrollRef}
              className="overflow-x-auto pb-2"
            >
              <table ref={tableRef} className="w-full table-auto text-left border-collapse text-[12px]">
              <thead>
                <tr>
                  {renderSortTh('kd_rup', 'Kode RUP')}
                  {renderSortTh('nama', 'Paket Pengadaan')}
                  {renderSortTh('satker', 'Satuan Kerja / K/L/PD')}
                  {renderSortTh('jenis', 'Jenis Pengadaan')}
                  {renderSortTh('jadwal', 'Jadwal Pemilihan')}
                  {renderSortTh('pagu', 'Pagu Anggaran')}
                  {renderSortTh('status_internal', 'Status Internal')}
                  <th className="bg-slate-50 border-b border-slate-200 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRup.map(r => {
                  const isNew = newRupSet.has(String(r.id)) && r.daysUntilSelection >= 120;
                  const todayRaw = new Date();
                  const currentMonthStr = `${todayRaw.getFullYear()}-${String(todayRaw.getMonth() + 1).padStart(2, '0')}`;
                  const isThisMonth = r.tgl_awal_pemilihan?.startsWith(currentMonthStr);
                  const monthsLeft = Math.max(1, Math.round((r.daysUntilSelection || 0) / 30));
                  
                  return (
                  <tr key={r.id} className={`transition-colors ${isNew ? 'bg-cyan-50/80 hover:bg-cyan-100/70 shadow-[inset_4px_0_0_#06b6d4]' : 'hover:bg-slate-50'}`}>
                    <td className="px-3 py-3 align-top">
                      <div className="font-mono text-[11px] font-bold text-slate-700 break-all">{r.kd_rup || '-'}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <button
                        onClick={() => setSelectedRupId(r.id)}
                        className="font-extrabold leading-snug line-clamp-2 text-left hover:text-blue-700 transition-colors"
                        title={`Klik untuk lihat detail: ${r.nama_paket}`}
                      >
                        {r.nama_paket}
                        {isNew && <Badge color="cyan" className="ml-1.5">Baru</Badge>}
                      </button>
                      <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-1.5 min-w-0">
                        <MapPin size={12} className="shrink-0" /><span className="truncate">{r.kabupaten || ''}, {r.provinsi || ''}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="text-xs font-bold text-slate-900 line-clamp-2">{r.nama_satker}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 truncate">{r.nama_klpd}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge color="gray">{r.jenis_pengadaan}</Badge>
                        <Badge color={r.metode_pengadaan === 'Seleksi' ? 'indigo' : 'gray'}>{r.metode_pengadaan}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="text-xs font-extrabold">{formatMonthYear(r.tgl_awal_pemilihan)}</div>
                      <Badge 
                        color={
                          isThisMonth ? 'red' :
                          monthsLeft <= 1 ? 'amber' : 
                          'green'
                        } 
                        className="mt-1"
                      >
                        {isThisMonth ? 'Bulan Ini' : `${monthsLeft} bulan lagi`}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 align-top whitespace-nowrap">
                      <div className="font-extrabold text-sm">{formatRupiah(r.pagu)}</div>
                    </td>
                    <td className="px-3 py-3 align-top">
                      {(() => {
                        const claim = rupClaims[String(r.kd_rup)] || null;
                        const viewerOwns = claim?.unit_kerja && claim.unit_kerja === unitKerja;
                        const canEdit = canEditClaim(claim?.unit_kerja);
                        return (
                          <RupStatusCell
                            rup={r}
                            claim={claim}
                            canEdit={canEdit}
                            viewerOwns={viewerOwns}
                            isGuest={isGuest}
                            updateRupStatus={updateRupStatus}
                            showToast={showToast}
                          />
                        );
                      })()}
                    </td>
                    <td className={`px-3 py-3 align-top ${isNew ? 'bg-cyan-50/95' : 'bg-white/95'}`}>
                      <div className="flex items-center gap-1">
                        <Btn className="ghost small" onClick={() => setSelectedRupId(r.id)}>
                          Detail<ChevronRight size={14} />
                        </Btn>
                        {isAdmin && (
                          <button
                            type="button"
                            title={r._imported ? 'Hapus baris RUP impor' : 'Sembunyikan RUP (admin)'}
                            onClick={async () => {
                              const label = r.nama_paket;
                              if (!confirm(r._imported
                                ? `Hapus baris RUP impor "${label}"?`
                                : `Sembunyikan RUP "${label}" dari semua user?`)) return;
                              try {
                                if (r._imported) {
                                  await deleteImportedRup(r.kd_rup);
                                  // optimistic local refresh — list re-renders next tick
                                  await reloadImports();
                                } else {
                                  await hideRup(r.kd_rup, 'admin delete');
                                }
                              } catch (e) { alert(`Gagal hapus: ${e.message || e}`); }
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
            {filteredRup.length === 0 && (
              <div className="p-7 text-center text-slate-500">
                Tidak ada data RUP yang cocok dengan filter saat ini.
              </div>
            )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

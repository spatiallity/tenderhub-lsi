import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, ChevronRight, Filter, X, FileSpreadsheet, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { Badge, PageTitle, Card, Btn } from '../components/UI/index';
import { portfolioColor, PROVINCES } from '../utils/constants';
import { formatRupiah, activeKeywordCount, exportRupExcel, formatMonthYear } from '../utils/helpers';
import { useDebounce } from '../hooks/useDebounce';

export default function RupPage() {
  const { rupList, keywords, setSelectedRupId, loadingRup, newRupIds, setShowKeywordManager, internalStatuses } = useAppContext();

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
      className={`bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-3 border-b border-slate-200 whitespace-nowrap cursor-pointer hover:text-slate-700 hover:bg-slate-100 transition-colors select-none ${className}`}
      onClick={() => toggleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={10} className="opacity-30" />}
      </span>
    </th>
  );

  // Debounce search input for better performance
  const debouncedSearch = useDebounce(rupSearch, 300);

  const keywordCount = useMemo(() => activeKeywordCount(keywords), [keywords]);
  const newRupSet = useMemo(() => new Set((newRupIds || []).map(String)), [newRupIds]);

  const topScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const tableRef = useRef(null);
  const isSyncingRef = useRef(false);
  const [scrollSpacerWidth, setScrollSpacerWidth] = useState(0);

  useEffect(() => {
    const updateSpacer = () => {
      const el = tableRef.current;
      if (!el) return;
      setScrollSpacerWidth(el.scrollWidth || 0);
    };
    updateSpacer();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateSpacer);
      if (tableScrollRef.current) ro.observe(tableScrollRef.current);
      if (tableRef.current) ro.observe(tableRef.current);
    }
    window.addEventListener('resize', updateSpacer);
    return () => {
      window.removeEventListener('resize', updateSpacer);
      if (ro) ro.disconnect();
    };
  }, [loadingRup, (rupList || []).length]);

  const filteredRup = useMemo(() => {
    let result = (rupList || []).filter(r => {
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
          case 'nama': va = (a.nama_paket || '').toLowerCase(); vb = (b.nama_paket || '').toLowerCase(); break;
          case 'satker': va = (a.nama_satker || '').toLowerCase(); vb = (b.nama_satker || '').toLowerCase(); break;
          case 'jenis': va = (a.jenis_pengadaan || '').toLowerCase(); vb = (b.jenis_pengadaan || '').toLowerCase(); break;
          case 'jadwal': va = a.daysUntilSelection ?? 999; vb = b.daysUntilSelection ?? 999; break;
          case 'pagu': va = a.pagu || 0; vb = b.pagu || 0; break;
          case 'portfolio': va = (a.recommendation || '').toLowerCase(); vb = (b.recommendation || '').toLowerCase(); break;
          default: return 0;
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    return result;
  }, [rupList, portfolioFilter, levelFilter, provinsiFilter, debouncedSearch, keywordCount, keywordOnly, sortKey, sortDir, showIrrelevant, internalStatuses]);

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
        subtitle={`${filteredRup.length} paket RUP tampil dari ${rupList?.length || 0} paket. Gunakan ini sebagai radar awal sebelum paket naik menjadi tender.`}
        right={
          <div className="flex gap-2 flex-wrap items-center">
            {filteredRup.length !== (rupList?.length || 0) && (
              <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-bold text-blue-700">
                  {filteredRup.length} hasil
                </span>
              </div>
            )}
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
              ref={topScrollRef}
              className="overflow-x-auto hscroll border-b border-slate-200 bg-slate-50/60"
              onScroll={() => {
                if (isSyncingRef.current) return;
                const a = topScrollRef.current;
                const b = tableScrollRef.current;
                if (!a || !b) return;
                isSyncingRef.current = true;
                b.scrollLeft = a.scrollLeft;
                requestAnimationFrame(() => { isSyncingRef.current = false; });
              }}
            >
              <div className="h-4" style={{ width: scrollSpacerWidth || 0 }} />
            </div>
            <div
              ref={tableScrollRef}
              className="overflow-x-auto hscrollHide pb-2"
              onScroll={() => {
                if (isSyncingRef.current) return;
                const a = topScrollRef.current;
                const b = tableScrollRef.current;
                if (!a || !b) return;
                isSyncingRef.current = true;
                a.scrollLeft = b.scrollLeft;
                requestAnimationFrame(() => { isSyncingRef.current = false; });
              }}
            >
              <table ref={tableRef} className="min-w-[1150px] w-full table-fixed text-left border-collapse text-[12px]">
              <colgroup>
                <col className="w-[31%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead>
                <tr>
                  {renderSortTh('nama', 'Paket Pengadaan')}
                  {renderSortTh('satker', 'Satuan Kerja / K/L/PD')}
                  {renderSortTh('jenis', 'Jenis Pengadaan')}
                  {renderSortTh('jadwal', 'Jadwal Pemilihan')}
                  {renderSortTh('pagu', 'Pagu Anggaran')}
                  {renderSortTh('portfolio', 'Portofolio')}
                  <th className="bg-slate-50 border-b border-slate-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRup.map(r => {
                  const isNew = newRupSet.has(String(r.id));
                  const todayRaw = new Date();
                  const currentMonthStr = `${todayRaw.getFullYear()}-${String(todayRaw.getMonth() + 1).padStart(2, '0')}`;
                  const isThisMonth = r.tgl_awal_pemilihan?.startsWith(currentMonthStr);
                  
                  return (
                  <tr key={r.id} className={`transition-colors ${isNew ? 'bg-cyan-50/80 hover:bg-cyan-100/70 shadow-[inset_4px_0_0_#06b6d4]' : 'hover:bg-slate-50'}`}>
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
                      <div className="text-slate-500 text-[10px] mt-0.5">Kode RUP: {r.kd_rup}</div>
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
                          r.daysUntilSelection <= 30 ? 'amber' : 
                          'green'
                        } 
                        className="mt-1"
                      >
                        {isThisMonth ? 'Bulan Ini' : `${r.daysUntilSelection} hari lagi`}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 align-top whitespace-nowrap">
                      <div className="font-extrabold text-sm">{formatRupiah(r.pagu)}</div>
                    </td>
                    <td className="px-3 py-3 align-top"><Badge color={portfolioColor[r.recommendation]}>{r.recommendation}</Badge></td>
                    <td className={`px-3 py-3 align-top ${isNew ? 'bg-cyan-50/95' : 'bg-white/95'}`}>
                      <Btn className="primary small" onClick={() => setSelectedRupId(r.id)}>
                        Detail<ChevronRight size={14} />
                      </Btn>
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

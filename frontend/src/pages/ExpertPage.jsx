import React, { useState, useMemo } from 'react';
import { Search, MapPin, ChevronRight, Filter, Star, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { Badge, PageTitle, Card, Btn, Stars } from '../components/UI/index';
import { portfolioColor, availabilityColor, avatarColors } from '../utils/constants';
import { formatRupiah, initials } from '../utils/helpers';

export default function ExpertPage() {
  const { experts, setSelectedExpertId, addExpert, showToast } = useAppContext();

  const [expertSearch, setExpertSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('Semua');
  const [portFilter, setPortFilter] = useState('Semua');
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [draft, setDraft] = useState({ 
    nama: '', instansi: '', noHp: '', keahlian: '', portfolio: 'SDA', availability: 'Tersedia',
    historyProyek: '', historyKlien: '', historyTahun: '', historyPeran: ''
  });

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

  const filteredExperts = useMemo(() => {
    let result = (experts || []).filter(e => {
      if (expertSearch.trim() && !`${e.nama} ${e.instansi} ${(e.keahlian || []).join(' ')}`.toLowerCase().includes(expertSearch.trim().toLowerCase())) return false;
      if (availFilter !== 'Semua' && e.availability !== availFilter) return false;
      if (portFilter !== 'Semua' && !(e.portofolio || []).includes(portFilter)) return false;
      return true;
    });
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        let va, vb;
        switch (sortKey) {
          case 'nama': va = (a.nama || '').toLowerCase(); vb = (b.nama || '').toLowerCase(); break;
          case 'instansi': va = (a.instansi || '').toLowerCase(); vb = (b.instansi || '').toLowerCase(); break;
          case 'keahlian': va = (a.keahlian || []).join(',').toLowerCase(); vb = (b.keahlian || []).join(',').toLowerCase(); break;
          case 'availability': va = (a.availability || '').toLowerCase(); vb = (b.availability || '').toLowerCase(); break;
          case 'rating': va = a.rating || 0; vb = b.rating || 0; break;
          case 'history': va = (a.history?.[0]?.proyek || '').toLowerCase(); vb = (b.history?.[0]?.proyek || '').toLowerCase(); break;
          default: return 0;
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    return result;
  }, [experts, expertSearch, availFilter, portFilter, sortKey, sortDir]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Database Tenaga Ahli"
        subtitle={`${filteredExperts.length} tenaga ahli tampil dari total ${experts?.length || 0}. Siapkan kandidat sejak fase RUP agar respons proposal lebih cepat.`}
        right={<Btn className="primary" onClick={() => setShowForm(true)}><Plus size={16} />Tambah Tenaga Ahli</Btn>}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-[slideUp_0.3s_ease-out]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900">Tambah Tenaga Ahli</h2>
                <p className="text-slate-500 text-[11px] mt-0.5">Isi profil ringkas untuk kandidat expert baru.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <input className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nama lengkap" value={draft.nama} onChange={e => setDraft(p => ({ ...p, nama: e.target.value }))} />
              <input className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Instansi / afiliasi" value={draft.instansi} onChange={e => setDraft(p => ({ ...p, instansi: e.target.value }))} />
              <input className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="No. HP" value={draft.noHp} onChange={e => setDraft(p => ({ ...p, noHp: e.target.value }))} />
              <input className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Keahlian utama (pisahkan koma)" value={draft.keahlian} onChange={e => setDraft(p => ({ ...p, keahlian: e.target.value }))} />
              <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" value={draft.availability} onChange={e => setDraft(p => ({ ...p, availability: e.target.value }))}>
                <option>Tersedia</option><option>Sedang Bertugas</option><option>Tidak Tersedia</option>
              </select>
              <select className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" value={draft.portfolio} onChange={e => setDraft(p => ({ ...p, portfolio: e.target.value }))}>
                <option value="SDA">SDA</option><option value="FLP">FLP</option><option value="FITI">FITI</option>
              </select>
              
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Riwayat Pekerjaan Terakhir</div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nama proyek" value={draft.historyProyek} onChange={e => setDraft(p => ({ ...p, historyProyek: e.target.value }))} />
                  <input className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Klien" value={draft.historyKlien} onChange={e => setDraft(p => ({ ...p, historyKlien: e.target.value }))} />
                  <input className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Tahun" value={draft.historyTahun} onChange={e => setDraft(p => ({ ...p, historyTahun: e.target.value }))} />
                  <input className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Peran" value={draft.historyPeran} onChange={e => setDraft(p => ({ ...p, historyPeran: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
              <Btn className="ghost" onClick={() => setShowForm(false)}>Batal</Btn>
              <Btn className="primary" onClick={async () => {
                try {
                  const history = [];
                  if (draft.historyProyek) {
                    history.push({
                      proyek: draft.historyProyek,
                      klien: draft.historyKlien,
                      tahun: draft.historyTahun,
                      peran: draft.historyPeran,
                      nilai: 0,
                      bersama: 'Sucofindo',
                      status: 'Selesai'
                    });
                  }
                  
                  const newExpert = {
                    ...draft,
                    keahlian: draft.keahlian.split(',').map(s => s.trim()).filter(Boolean),
                    history
                  };
                  
                  console.log('Submitting expert:', newExpert);
                  const success = await addExpert(newExpert);
                  console.log('Add expert result:', success);
                  
                  if (success) {
                    // Reset form
                    setDraft({ 
                      nama: '', instansi: '', noHp: '', keahlian: '', portfolio: 'SDA', availability: 'Tersedia',
                      historyProyek: '', historyKlien: '', historyTahun: '', historyPeran: ''
                    });
                    
                    // Reset filters to show new expert
                    setExpertSearch('');
                    setAvailFilter('Semua');
                    setPortFilter('Semua');
                    setSortKey('');
                    
                    // Close form
                    setShowForm(false);
                  }
                } catch (error) {
                  console.error('Error adding expert:', error);
                  showToast('Terjadi kesalahan saat menambah tenaga ahli', 'error');
                }
              }}>Simpan</Btn>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-3.5">
          <Filter size={16} className="text-blue-600" />
          <h2 className="text-base font-extrabold tracking-tight">Filter Expert</h2>
        </div>
        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              placeholder="Cari nama tenaga ahli, institusi, atau keahlian..." 
              value={expertSearch}
              onChange={e => setExpertSearch(e.target.value)} 
              className="w-full pl-8 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl flex-wrap">
            {['Semua', 'Tersedia', 'Sedang Bertugas', 'Tidak Tersedia'].map(a => (
              <button key={a} className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-shadow ${availFilter === a ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-transparent text-slate-500 hover:text-slate-800'}`} onClick={() => setAvailFilter(a)}>{a}</button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr>
                {renderSortTh('nama', 'Nama & Profil')}
                {renderSortTh('instansi', 'Instansi / Afiliasi', 'hidden xl:table-cell')}
                {renderSortTh('keahlian', 'Keahlian (Tags)')}
                {renderSortTh('availability', 'Ketersediaan')}
                {renderSortTh('rating', 'Rating')}
                {renderSortTh('history', 'Riwayat Terakhir', 'hidden 2xl:table-cell')}
                <th className="bg-slate-50 border-b border-slate-200 sticky right-0 z-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExperts.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-[38px] h-[38px] rounded-full text-white font-extrabold flex items-center justify-center shrink-0" style={{ background: avatarColors[e.id % avatarColors.length] }}>
                        {initials(e.nama)}
                      </div>
                      <div>
                        <div className="font-extrabold leading-snug text-slate-900">{e.nama}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{e.noHp || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top hidden xl:table-cell"><div className="text-xs font-bold text-slate-700">{e.instansi}</div></td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(e.keahlian || []).slice(0, 3).map(k => <Badge key={k} color="indigo">{k}</Badge>)}
                      {(e.keahlian || []).length > 3 && <Badge color="gray">+{e.keahlian.length - 3}</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top"><Badge color={availabilityColor[e.availability]}>{e.availability}</Badge></td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-1 mt-1">
                      <Stars rating={(e.reviews || []).length ? e.rating : 0} />
                      <div className="text-[10px] text-slate-500">{e.reviews?.length || 0} reviews</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top min-w-[180px] hidden 2xl:table-cell">
                    {e.history && e.history.length > 0 ? (
                      <>
                        <div className="text-[11px] font-bold text-slate-800 line-clamp-2">{e.history[0].proyek}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{e.history[0].klien} ({e.history[0].tahun})</div>
                      </>
                    ) : <span className="text-xs text-slate-400">Belum ada riwayat</span>}
                  </td>
                  <td className="px-3 py-3 align-top sticky right-0 bg-white/95 backdrop-blur-sm">
                    <Btn className="primary small" onClick={() => setSelectedExpertId(e.id)}>
                      Profil<ChevronRight size={14} />
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredExperts.length === 0 && (
            <div className="p-7 text-center text-slate-500">
              Tidak ada tenaga ahli yang cocok dengan filter saat ini.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

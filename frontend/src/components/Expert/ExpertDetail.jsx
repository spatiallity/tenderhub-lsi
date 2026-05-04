import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Save, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Badge, Stars, Btn, Card } from '../UI/index';
import { portfolioColor, availabilityColor, avatarColors } from '../../utils/constants';
import { formatRupiah, initials } from '../../utils/helpers';
import { useAppContext } from '../../store/AppContext';

export default function ExpertDetail({ expert }) {
  const {
    reviewDraft, setReviewDraft, addReview,
    historyDraft, setHistoryDraft, addHistory,
    updateExpertProfile, deleteExpert, deleteExpertHistory
  } = useAppContext();

  if (!expert) return null;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ nama: '', noHp: '', instansi: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);

  useEffect(() => {
    setProfileDraft({
      nama: expert.nama || '',
      noHp: expert.noHp || '',
      instansi: expert.instansi || '',
    });
  }, [expert]);

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Mock availability data (in production, this would come from expert.availability_calendar)
    const availability = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const rand = Math.random();
      availability[i] = rand > 0.7 ? 'busy' : rand > 0.3 ? 'available' : 'tentative';
    }

    return {
      year,
      month,
      daysInMonth,
      startingDayOfWeek,
      availability,
      monthName: firstDay.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    };
  }, [currentMonth, expert]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex gap-4 items-start">
        <div className="w-[60px] h-[60px] rounded-full text-white font-extrabold flex items-center justify-center shrink-0 text-2xl" style={{ background: avatarColors[expert.id % avatarColors.length] }}>
          {initials(expert.nama)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight leading-snug mb-1">{expert.nama}</h2>
          <div className="text-slate-500 text-[13px] mb-2">
            No. HP: {expert.noHp || 'Tidak tersedia'} | {expert.instansi}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge color={availabilityColor[expert.availability]}>{expert.availability}</Badge>
            {(expert.portofolio || []).map(p => <Badge key={p} color={portfolioColor[p]}>{p}</Badge>)}
          </div>
          <div className="flex items-center gap-1.5">
            <Stars rating={(expert.reviews || []).length ? (expert.rating || 0) : 0} />
            <span className="text-xs font-extrabold">{(expert.reviews || []).length ? `${expert.rating} overall` : 'Belum direview'}</span>
          </div>
        </div>
      </div>

      {/* Edit Profil Ringkas */}
      <Card className="bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="text-base font-extrabold tracking-tight">Edit Data Tenaga Ahli</div>
          <div className="flex items-center gap-2">
            {!isEditingProfile ? (
              <button
                className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit
              </button>
            ) : null}
            <button
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                isEditingProfile
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
              }`}
              disabled={!isEditingProfile}
              onClick={async () => {
                if (!isEditingProfile) return;
                await updateExpertProfile(expert.id, profileDraft);
                setIsEditingProfile(false);
              }}
              title={isEditingProfile ? 'Simpan perubahan' : 'Klik Edit dulu untuk mengubah data'}
            >
              <Save size={13} />
              Simpan
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" disabled={!isEditingProfile} placeholder="Nama lengkap" value={profileDraft.nama} onChange={e => setProfileDraft(prev => ({ ...prev, nama: e.target.value }))} />
          <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" disabled={!isEditingProfile} placeholder="No. HP" value={profileDraft.noHp} onChange={e => setProfileDraft(prev => ({ ...prev, noHp: e.target.value }))} />
          <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" disabled={!isEditingProfile} placeholder="Instansi / afiliasi" value={profileDraft.instansi} onChange={e => setProfileDraft(prev => ({ ...prev, instansi: e.target.value }))} />
        </div>
        {isEditingProfile && (
          <div className="flex gap-2 mt-3">
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-extrabold hover:bg-slate-300 transition-colors"
              onClick={() => {
                setProfileDraft({
                  nama: expert.nama || '',
                  noHp: expert.noHp || '',
                  instansi: expert.instansi || '',
                });
                setIsEditingProfile(false);
              }}
            >
              Batal
            </button>
          </div>
        )}
      </Card>

      {/* Keahlian */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Keahlian</div>
        <div className="flex flex-wrap gap-1.5">
          {(expert.keahlian || []).map(k => <Badge key={k} color="indigo">{k}</Badge>)}
        </div>
      </div>



      {/* Riwayat Pekerjaan */}
      <div>
        <div className="text-base font-extrabold tracking-tight mb-2">Riwayat Pekerjaan</div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Nama Proyek</th>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Pemberi Kerja</th>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Tahun</th>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Nilai</th>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Peran</th>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Bersama</th>
                <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 whitespace-nowrap">Status</th>
                <th className="bg-slate-50/50 text-slate-500 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(expert.history || []).map((h, i) => (
                <tr key={`${h.proyek}-${i}`} className="hover:bg-slate-50 transition-colors">
                  <td className="text-xs font-extrabold px-3 py-2.5 min-w-[150px]">{h.proyek}</td>
                  <td className="text-xs text-slate-600 px-3 py-2.5">{h.klien}</td>
                  <td className="text-xs px-3 py-2.5">{h.tahun}</td>
                  <td className="text-xs font-extrabold px-3 py-2.5 whitespace-nowrap">{formatRupiah(h.nilai)}</td>
                  <td className="text-xs px-3 py-2.5">{h.peran}</td>
                  <td className="px-3 py-2.5"><Badge color={h.bersama === 'Sucofindo' ? 'blue' : 'gray'}>{h.bersama}</Badge></td>
                  <td className="px-3 py-2.5"><Badge color="green">{h.status}</Badge></td>
                  <td className="px-3 py-2.5">
                    <button 
                      onClick={() => deleteExpertHistory(expert.id, h.id)}
                      className="text-red-400 hover:text-red-600 transition-colors" title="Hapus riwayat">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tambah Riwayat */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3">
          <div className="font-extrabold text-[13px] mb-2">Tambah Riwayat Pekerjaan</div>
          <div className="grid grid-cols-2 gap-2">
            <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nama proyek" value={historyDraft.proyek} onChange={e => setHistoryDraft(p => ({ ...p, proyek: e.target.value }))} />
            <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Pemberi kerja" value={historyDraft.klien} onChange={e => setHistoryDraft(p => ({ ...p, klien: e.target.value }))} />
            <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Tahun" value={historyDraft.tahun} onChange={e => setHistoryDraft(p => ({ ...p, tahun: e.target.value }))} />
            <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nilai (juta Rp)" type="number" value={historyDraft.nilai} onChange={e => setHistoryDraft(p => ({ ...p, nilai: e.target.value }))} />
            <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Peran" value={historyDraft.peran} onChange={e => setHistoryDraft(p => ({ ...p, peran: e.target.value }))} />
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" value={historyDraft.bersama} onChange={e => setHistoryDraft(p => ({ ...p, bersama: e.target.value }))}>
              <option>Sucofindo</option><option>Lain</option>
            </select>
          </div>
          <Btn 
            className="primary small mt-3" 
            onClick={async () => {
              if (isSavingHistory) return;
              setIsSavingHistory(true);
              try {
                await addHistory(expert.id);
              } finally {
                setIsSavingHistory(false);
              }
            }}
            disabled={isSavingHistory}
          >
            <Plus size={14} />{isSavingHistory ? 'Menyimpan...' : 'Simpan Riwayat'}
          </Btn>
        </div>
      </div>

      {/* Rating & Review */}
      <div>
        <div className="text-base font-extrabold tracking-tight mb-2">Rating & Review</div>
        <div className="flex flex-col gap-2 mb-3">
          {(expert.reviews || []).length === 0 && <div className="text-slate-500 text-xs">Belum ada review.</div>}
          {(expert.reviews || []).map((r, i) => (
            <div key={`${r.reviewer}-${i}`} className="border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
              <div className="flex justify-between items-center gap-2 mb-1.5">
                <div className="text-xs font-extrabold">{r.reviewer}</div>
                <div className="flex items-center gap-1.5">
                  <Stars rating={r.rating} size={12} />
                  <span className="text-slate-500 text-[10px]">{r.tanggal}</span>
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">{r.komentar}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="font-extrabold text-[13px] mb-2">Tambah Review</div>
          <div className="flex flex-col gap-2">
            <input className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Nama reviewer" value={reviewDraft.reviewer} onChange={e => setReviewDraft(p => ({ ...p, reviewer: e.target.value }))} />
            <Stars rating={reviewDraft.rating} size={22} onRate={(rating) => setReviewDraft(p => ({ ...p, rating }))} />
            <textarea className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none min-h-[76px] resize-y" placeholder="Komentar review..." value={reviewDraft.komentar} onChange={e => setReviewDraft(p => ({ ...p, komentar: e.target.value }))} />
            <Btn 
              className="primary small self-start" 
              onClick={async () => {
                if (isSavingReview) return;
                setIsSavingReview(true);
                try {
                  await addReview(expert.id);
                } finally {
                  setIsSavingReview(false);
                }
              }}
              disabled={isSavingReview}
            >
              <Save size={14} />{isSavingReview ? 'Menyimpan...' : 'Simpan Review'}
            </Btn>
          </div>
        </div>
      </div>

      {/* Delete Expert */}
      <div className="mt-4 border-t border-red-100 pt-4">
        <button 
          onClick={async () => {
            if (window.confirm(`Apakah Anda yakin ingin menghapus ${expert.nama}?`)) {
              await deleteExpert(expert.id);
            }
          }}
          className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-extrabold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Hapus Tenaga Ahli
        </button>
      </div>

    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Save, Calendar as CalendarIcon, Trash2, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Badge, Stars, Btn, Card } from '../UI/index';
import { portfolioColor, availabilityColor, avatarColors } from '../../utils/constants';
import { formatRupiah, initials } from '../../utils/helpers';
import { useAppContext } from '../../store/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Sub-component: editable CV fields for a single project
function ProjectCVFields({ project, isGuest }) {
  const [draft, setDraft] = useState({
    lokasi_proyek: project.lokasi_proyek || '',
    pengguna_jasa: project.pengguna_jasa || '',
    uraian_tugas: project.uraian_tugas || '',
    waktu_mulai: project.waktu_mulai || '',
    waktu_selesai: project.waktu_selesai || '',
    posisi_penugasan: project.posisi_penugasan || '',
    status_kepegawaian: project.status_kepegawaian || 'Tidak Tetap',
    surat_referensi: project.surat_referensi || '-',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/experts/projects/${project.id}`, draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Gagal menyimpan'); } finally { setSaving(false); }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
      <div className="text-xs font-extrabold text-slate-700 mb-2 truncate">{project.proyek || project.nama_proyek}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Lokasi Proyek</label>
          <input className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Misal: Jakarta Selatan, DKI Jakarta"
            value={draft.lokasi_proyek} onChange={e => setDraft(p => ({ ...p, lokasi_proyek: e.target.value }))} disabled={isGuest} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Pengguna Jasa</label>
          <input className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Misal: Direktorat Perencanaan, Otorita IKN"
            value={draft.pengguna_jasa} onChange={e => setDraft(p => ({ ...p, pengguna_jasa: e.target.value }))} disabled={isGuest} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Waktu Mulai</label>
          <input className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Misal: Agustus 2025"
            value={draft.waktu_mulai} onChange={e => setDraft(p => ({ ...p, waktu_mulai: e.target.value }))} disabled={isGuest} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Waktu Selesai</label>
          <input className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Misal: Desember 2025"
            value={draft.waktu_selesai} onChange={e => setDraft(p => ({ ...p, waktu_selesai: e.target.value }))} disabled={isGuest} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Posisi Penugasan</label>
          <input className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Misal: Ahli Perencanaan Wilayah"
            value={draft.posisi_penugasan} onChange={e => setDraft(p => ({ ...p, posisi_penugasan: e.target.value }))} disabled={isGuest} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Status Kepegawaian</label>
          <select className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            value={draft.status_kepegawaian} onChange={e => setDraft(p => ({ ...p, status_kepegawaian: e.target.value }))} disabled={isGuest}>
            <option>Tidak Tetap</option>
            <option>Tetap</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Surat Referensi</label>
          <input className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Misal: 10/SK/RENTEK/04/2023 atau -"
            value={draft.surat_referensi} onChange={e => setDraft(p => ({ ...p, surat_referensi: e.target.value }))} disabled={isGuest} />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Uraian Tugas</label>
          <textarea className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-100 resize-y min-h-[60px]"
            placeholder="Deskripsi tugas dalam proyek ini..."
            value={draft.uraian_tugas} onChange={e => setDraft(p => ({ ...p, uraian_tugas: e.target.value }))} disabled={isGuest} />
        </div>
      </div>
      {!isGuest && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${saved ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <Save size={12} /> {saving ? 'Menyimpan...' : saved ? 'Tersimpan ✓' : 'Simpan'}
        </button>
      )}
    </div>
  );
}

export default function ExpertDetail({ expert, onClose }) {
  const { canAddReview, canAddHistory, isGuest } = useAuth();
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // CV state
  const [showCV, setShowCV] = useState(false);
  const [cvDraft, setCvDraft] = useState({
    posisi_diusulkan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    pendidikan_formal: [],
    pendidikan_non_formal: [],
    penguasaan_bahasa: [],
  });
  const [isSavingCV, setIsSavingCV] = useState(false);
  // array field input drafts
  const [pendFormalInput, setPendFormalInput] = useState('');
  const [pendNonFormalInput, setPendNonFormalInput] = useState('');
  const [bahasaInput, setBahasaInput] = useState('');

  useEffect(() => {
    setCvDraft({
      posisi_diusulkan: expert?.posisi_diusulkan || '',
      tempat_lahir: expert?.tempat_lahir || '',
      tanggal_lahir: expert?.tanggal_lahir || '',
      pendidikan_formal: expert?.pendidikan_formal || [],
      pendidikan_non_formal: expert?.pendidikan_non_formal || [],
      penguasaan_bahasa: expert?.penguasaan_bahasa || [],
    });
  }, [expert?.id]);

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

      {/* Expert Info Summary */}
      <Card className="bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex flex-wrap gap-2">
            <Badge color={availabilityColor[expert.availability]}>{expert.availability}</Badge>
            {(expert.portofolio || []).map(p => <Badge key={p} color={portfolioColor[p]}>{p}</Badge>)}
          </div>
        </div>
        <div className="text-sm text-slate-600 mb-2">
          <strong>No. HP:</strong> {expert.noHp || 'Tidak tersedia'}
        </div>
        <div className="flex items-center gap-2">
          <Stars rating={(expert.reviews || []).length ? (expert.rating || 0) : 0} />
          <span className="text-sm font-semibold">{(expert.reviews || []).length ? `${expert.rating} overall` : 'Belum direview'}</span>
        </div>
      </Card>

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

        {canAddReview ? (
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
                try { await addReview(expert.id); } finally { setIsSavingReview(false); }
              }}
              disabled={isSavingReview}
            >
              <Save size={14} />{isSavingReview ? 'Menyimpan...' : 'Simpan Review'}
            </Btn>
          </div>
        </div>
        ) : (
          <div className="text-xs text-slate-400 italic">Login untuk menambahkan review.</div>
        )}
      </div>

      {/* CV Section */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowCV(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-extrabold text-sm flex items-center gap-2">
            <FileText size={16} className="text-blue-600" /> Data CV (Template Sucofindo)
          </span>
          {showCV ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showCV && (
          <div className="p-4 flex flex-col gap-5">

            {/* ── Data Pribadi ── */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Data Pribadi</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500 font-semibold">Posisi yang Diusulkan</label>
                  <input
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Misal: Team Leader, Ahli Geodesi"
                    value={cvDraft.posisi_diusulkan}
                    onChange={e => setCvDraft(p => ({ ...p, posisi_diusulkan: e.target.value }))}
                    disabled={isGuest}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500 font-semibold">Tempat Lahir</label>
                  <input
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Misal: Bandung"
                    value={cvDraft.tempat_lahir}
                    onChange={e => setCvDraft(p => ({ ...p, tempat_lahir: e.target.value }))}
                    disabled={isGuest}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500 font-semibold">Tanggal Lahir</label>
                  <input
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Misal: 7 Juli 1967"
                    value={cvDraft.tanggal_lahir}
                    onChange={e => setCvDraft(p => ({ ...p, tanggal_lahir: e.target.value }))}
                    disabled={isGuest}
                  />
                </div>
              </div>
            </div>

            {/* ── Pendidikan Formal ── */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Pendidikan Formal</div>
              <div className="flex flex-col gap-1">
                {cvDraft.pendidikan_formal.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-slate-100">
                    <span className="flex-1">{item}</span>
                    {!isGuest && (
                      <button onClick={() => setCvDraft(p => ({ ...p, pendidikan_formal: p.pendidikan_formal.filter((_, j) => j !== i) }))}
                        className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
              {!isGuest && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Misal: S1 Teknik Planologi ITB (1990)"
                    value={pendFormalInput}
                    onChange={e => setPendFormalInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && pendFormalInput.trim()) {
                        setCvDraft(p => ({ ...p, pendidikan_formal: [...p.pendidikan_formal, pendFormalInput.trim()] }));
                        setPendFormalInput('');
                      }
                    }}
                  />
                  <Btn className="primary small" onClick={() => {
                    if (!pendFormalInput.trim()) return;
                    setCvDraft(p => ({ ...p, pendidikan_formal: [...p.pendidikan_formal, pendFormalInput.trim()] }));
                    setPendFormalInput('');
                  }}><Plus size={13} /></Btn>
                </div>
              )}
            </div>

            {/* ── Pendidikan Non Formal ── */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Pendidikan Non Formal / Pelatihan</div>
              <div className="flex flex-col gap-1">
                {cvDraft.pendidikan_non_formal.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-slate-100">
                    <span className="flex-1">{item}</span>
                    {!isGuest && (
                      <button onClick={() => setCvDraft(p => ({ ...p, pendidikan_non_formal: p.pendidikan_non_formal.filter((_, j) => j !== i) }))}
                        className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
              {!isGuest && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Misal: Training Certificate GIS (2019)"
                    value={pendNonFormalInput}
                    onChange={e => setPendNonFormalInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && pendNonFormalInput.trim()) {
                        setCvDraft(p => ({ ...p, pendidikan_non_formal: [...p.pendidikan_non_formal, pendNonFormalInput.trim()] }));
                        setPendNonFormalInput('');
                      }
                    }}
                  />
                  <Btn className="primary small" onClick={() => {
                    if (!pendNonFormalInput.trim()) return;
                    setCvDraft(p => ({ ...p, pendidikan_non_formal: [...p.pendidikan_non_formal, pendNonFormalInput.trim()] }));
                    setPendNonFormalInput('');
                  }}><Plus size={13} /></Btn>
                </div>
              )}
            </div>

            {/* ── Penguasaan Bahasa ── */}
            <div className="flex flex-col gap-2">
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Penguasaan Bahasa</div>
              <div className="flex flex-wrap gap-1.5">
                {cvDraft.penguasaan_bahasa.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
                    {item}
                    {!isGuest && (
                      <button onClick={() => setCvDraft(p => ({ ...p, penguasaan_bahasa: p.penguasaan_bahasa.filter((_, j) => j !== i) }))}
                        className="text-slate-400 hover:text-red-500 ml-0.5"><X size={10} /></button>
                    )}
                  </span>
                ))}
              </div>
              {!isGuest && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Misal: Bahasa Indonesia Baik"
                    value={bahasaInput}
                    onChange={e => setBahasaInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && bahasaInput.trim()) {
                        setCvDraft(p => ({ ...p, penguasaan_bahasa: [...p.penguasaan_bahasa, bahasaInput.trim()] }));
                        setBahasaInput('');
                      }
                    }}
                  />
                  <Btn className="primary small" onClick={() => {
                    if (!bahasaInput.trim()) return;
                    setCvDraft(p => ({ ...p, penguasaan_bahasa: [...p.penguasaan_bahasa, bahasaInput.trim()] }));
                    setBahasaInput('');
                  }}><Plus size={13} /></Btn>
                </div>
              )}
            </div>

            {/* ── Simpan Data Pribadi CV ── */}
            {!isGuest && (
              <Btn className="primary small self-start" disabled={isSavingCV} onClick={async () => {
                setIsSavingCV(true);
                try {
                  await api.patch(`/experts/${expert.id}`, {
                    posisi_diusulkan: cvDraft.posisi_diusulkan,
                    tempat_lahir: cvDraft.tempat_lahir,
                    tanggal_lahir: cvDraft.tanggal_lahir,
                    pendidikan_formal: cvDraft.pendidikan_formal,
                    pendidikan_non_formal: cvDraft.pendidikan_non_formal,
                    penguasaan_bahasa: cvDraft.penguasaan_bahasa,
                  });
                  alert('Data CV disimpan');
                } catch { alert('Gagal menyimpan'); } finally { setIsSavingCV(false); }
              }}><Save size={13} /> {isSavingCV ? 'Menyimpan...' : 'Simpan Data CV'}</Btn>
            )}

            {/* ── Data Proyek (CV fields) ── */}
            <div>
              <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">Data Proyek untuk CV</div>
              <div className="flex flex-col gap-4">
                {(expert.history || []).map((h) => (
                  <ProjectCVFields key={h.id} project={h} isGuest={isGuest} />
                ))}
                {(expert.history || []).length === 0 && (
                  <div className="text-xs text-slate-400 italic">Belum ada riwayat proyek.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Delete Expert */}
      <div className="mt-4 border-t border-red-100 pt-4">
        {!showConfirmDelete ? (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowConfirmDelete(true);
            }}
            className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-extrabold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} /> Hapus Tenaga Ahli
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 animate-fadeIn">
            <div className="text-sm font-extrabold text-red-700 text-center leading-snug">
              Apakah Anda yakin ingin menghapus {expert.nama}? Data yang dihapus tidak dapat dikembalikan.
            </div>
            <div className="flex gap-2 w-full">
              <button 
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 rounded-lg bg-white text-slate-700 text-xs font-extrabold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={async () => {
                  await deleteExpert(expert.id);
                  setShowConfirmDelete(false);
                }}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-extrabold shadow-sm hover:bg-red-700 hover:shadow transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

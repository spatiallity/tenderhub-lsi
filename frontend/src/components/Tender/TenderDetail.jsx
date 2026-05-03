import React, { useEffect, useRef } from 'react';
import { ExternalLink, CheckCircle, Circle, Save, Trash2 } from 'lucide-react';
import { Badge, MiniKpi, Btn } from '../UI/index';
import { portfolioColor, levelColor, PRAKUAL_STAGES, PASCAKUAL_STAGES, TODAY } from '../../utils/constants';
import { formatRupiah, formatDate, dateFrom } from '../../utils/helpers';
import { useAppContext } from '../../store/AppContext';
import { useDebounce } from '../../hooks/useDebounce';

export default function TenderDetail({ tender }) {
  const {
    tenderNotes, setTenderNotes, addTenderNote,
    noteSaved, setNoteSaved,
    internalStatuses, updateTenderStatus,
    assignedPICs, updateTenderPIC,
    users, showToast
  } = useAppContext();

  if (!tender) return null;


  const status = internalStatuses[tender.id] || tender.internalStatus || 'Dipantau';
  const setStatus = (val) => updateTenderStatus(tender.id, val);
  const assignedPIC = assignedPICs[tender.id] || '';
  const assignPIC = (userId) => updateTenderPIC(tender.id, userId);

  // Removed auto-save logic as we now use an array of explicit notes



  const stages = tender.metode === 'Prakualifikasi' ? PRAKUAL_STAGES : PASCAKUAL_STAGES;
  const currentStage = tender.currentStage || 1;
  const currentStageName = stages[currentStage - 1]?.[0] || '';
  const isWinnerAnnouncementReached = currentStageName === 'Pengumuman Pemenang' || currentStageName === 'Masa Sanggah Pemenang' || currentStageName.includes('Pemenang');
  
  const deadlineLabel = tender.daysLeft < 0 ? `${Math.abs(tender.daysLeft)}h lewat` : `${tender.daysLeft}h`;
  const progressPercentage = ((currentStage - 1) / (stages.length - 1)) * 100;
  
  // Note state
  const notes = tenderNotes[tender.id] || [];
  const [newNote, setNewNote] = React.useState('');
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID');
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    addTenderNote(tender.id, { author: 'Admin LSI', content: newNote, date: dateStr, time: timeStr });
    setNewNote('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge color={portfolioColor[tender.recommendation]}>{tender.recommendation}</Badge>
        <Badge color="gray">{tender.mtd_pemilihan || tender.metode}</Badge>
        <Badge color={levelColor[tender.level]}>{tender.level}</Badge>
        {tender.jenis_pengadaan && <Badge color="indigo">{tender.jenis_pengadaan}</Badge>}
        {tender.sumber_dana && <Badge color={tender.sumber_dana === 'APBN' ? 'blue' : 'teal'}>{tender.sumber_dana}</Badge>}
        {tender.kualifikasi_paket && <Badge color="amber">{tender.kualifikasi_paket}</Badge>}
      </div>

      <h2 className="text-[17px] font-extrabold tracking-tight leading-snug">{tender.nama}</h2>
      <div className="text-slate-500 text-xs mt-1">
        {tender.instansi}{tender.nama_satker ? ` - ${tender.nama_satker}` : ''}
      </div>
      <div className="mt-1">
        <a href={tender.lpse} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs hover:underline hover:text-blue-800 break-all">
          {tender.lpse}<ExternalLink size={12} className="shrink-0" />
        </a>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 gap-2.5 my-4">
        <MiniKpi label="Pagu Anggaran" value={formatRupiah(tender.pagu || tender.hps)} />
        <MiniKpi label="Nilai HPS" value={formatRupiah(tender.hps)} />
        <MiniKpi label="Sisa Hari Tahap Ini" value={deadlineLabel}
          color={tender.daysLeft <= 3 ? '#dc2626' : tender.daysLeft <= 7 ? '#d97706' : '#16a34a'} />
        <MiniKpi label="Tahun Anggaran" value={tender.tahun_anggaran || '-'} />
      </div>

      {/* Progress Bar Visualization */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Progress Tahapan Tender</div>
            <div className="text-xs text-slate-600 mt-0.5">
              Tahap {currentStage} dari {stages.length} tahap
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-blue-600">{Math.round(progressPercentage)}%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Selesai</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner border border-blue-100">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-md"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Stage Milestones */}
        <div className="flex justify-between mt-3 px-1">
          {[
            { label: 'Mulai', stage: 1 },
            { label: 'Evaluasi', stage: Math.floor(stages.length / 2) },
            { label: 'Selesai', stage: stages.length }
          ].map((milestone, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full mb-1 ${
                currentStage >= milestone.stage 
                  ? 'bg-blue-600 ring-2 ring-blue-200' 
                  : 'bg-slate-300'
              }`} />
              <div className={`text-[10px] font-bold ${
                currentStage >= milestone.stage ? 'text-blue-700' : 'text-slate-400'
              }`}>
                {milestone.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info INAPROC */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
          Informasi Pengadaan (INAPROC)
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            ['Jenis KLPD', tender.jenis_klpd],
            ['Jenis Pengadaan', tender.jenis_pengadaan],
            ['Metode Pemilihan', tender.mtd_pemilihan],
            ['Metode Evaluasi', tender.mtd_evaluasi],
            ['Metode Kualifikasi', tender.mtd_kualifikasi || tender.metode],
            ['Kualifikasi Paket', tender.kualifikasi_paket],
            ['Sumber Dana', tender.sumber_dana],
            ['Kontrak Pembayaran', tender.kontrak_pembayaran],
            ['Kode Tender', tender.kd_tender],
            ['Kode RUP', tender.kd_rup],
            ['Tgl. Pengumuman', tender.tgl_pengumuman],
            ['Lokasi Pekerjaan', tender.lokasi_pekerjaan],
            ['Nama PPK', tender.nama_ppk],
            ['Nama Pokja', tender.nama_pokja],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-bold text-slate-500">{label}</div>
              <div className="text-xs font-semibold text-slate-900 mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Match */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Keyword Match
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tender.matched?.length
            ? tender.matched.map(k => <Badge key={k} color="green">{k}</Badge>)
            : <Badge color="gray">Belum ada keyword cocok</Badge>
          }
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
          Timeline Tahapan Tender
        </div>
        <div className="flex flex-col">
          {stages.map(([stage, color], i) => {
            const num = i + 1;
            const past = num < currentStage;
            const current = num === currentStage;
            const start = dateFrom(TODAY, (num - currentStage) * 3 - 2);
            const end = dateFrom(TODAY, (num - currentStage) * 3);
            const changes = tender.changes?.[num] || 0;
            return (
              <div key={stage} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-[23px] h-[23px] rounded-full border-2 flex items-center justify-center shrink-0 ${current ? 'border-blue-600 bg-blue-50' : past ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-white'}`}>
                    {past
                      ? <CheckCircle size={13} className="text-slate-400" />
                      : current
                        ? <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        : <Circle size={12} className="text-slate-300" />
                    }
                  </div>
                  {i < stages.length - 1 && <div className="w-[2px] h-6 bg-slate-200 my-0.5" />}
                </div>
                <div className="pb-3 flex-1">
                  <div className={`text-xs ${current ? 'font-extrabold text-slate-900' : past ? 'font-bold text-slate-400' : 'font-bold text-slate-900'}`}>
                    {num}. {stage}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatDate(start)} - {formatDate(end)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {current && <Badge color={color}>Tahap saat ini</Badge>}
                    {changes > 0 && <Badge color="amber">{changes} kali perubahan</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Internal + Catatan */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Status Internal
        </div>
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)} 
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none mb-3"
        >
          {['Dipantau', 'Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah', 'Tidak Relevan'].map(s => {
            const isDisabled = s === 'Menang' && !isWinnerAnnouncementReached;
            return (
              <option key={s} value={s} disabled={isDisabled}>
                {s} {isDisabled ? '(Belum Pengumuman)' : ''}
              </option>
            );
          })}
        </select>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
            Catatan Internal
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mb-3 max-h-48 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="text-xs text-slate-400 italic">Belum ada catatan.</div>
          ) : (
            notes.map((n, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-xs text-slate-800">{n.author}</div>
                  <div className="text-[10px] text-slate-400">{n.date} {n.time}</div>
                </div>
                <div className="text-xs text-slate-600 whitespace-pre-wrap">{n.content}</div>
              </div>
            ))
          )}
        </div>

        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Tulis catatan koordinasi, kebutuhan dokumen..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-y min-h-[60px]"
        />
        <div className="flex mt-2 justify-end">
          <Btn className="primary small" onClick={handleAddNote}>
            <Save size={14} />Tambah Catatan
          </Btn>
        </div>
      </div>

      {/* Assign PIC */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Assign PIC Tender
        </div>
        <select 
          value={assignedPIC} 
          onChange={e => assignPIC(e.target.value)} 
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
        >
          <option value="">-- Pilih PIC Tender --</option>
          {users.filter(u => u.aktif).map(u => (
            <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>
          ))}
        </select>
      </div>

      {/* Add shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

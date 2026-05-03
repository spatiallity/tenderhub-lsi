import React, { useMemo } from 'react';
import { Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge, MiniKpi } from '../UI/index';
import { portfolioColor } from '../../utils/constants';
import { formatRupiah, formatMonthYear } from '../../utils/helpers';
import { useAppContext } from '../../store/AppContext';

export default function RupDetail({ rup }) {
  const { internalStatuses, setInternalStatuses } = useAppContext();
  
  if (!rup) return null;
  
  const status = internalStatuses[rup.id] || 'Dipantau';
  const setStatus = (val) => setInternalStatuses(prev => ({ ...prev, [rup.id]: val }));



  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge color={portfolioColor[rup.recommendation]}>{rup.recommendation}</Badge>
        <Badge color={rup.metode_pengadaan === 'Seleksi' ? 'indigo' : 'gray'}>{rup.metode_pengadaan}</Badge>
        <Badge color="cyan">{rup.tipe_paket}</Badge>
      </div>
      
      <h2 className="text-[17px] font-extrabold tracking-tight leading-snug">{rup.nama_paket}</h2>
      <div className="text-slate-500 text-xs mt-1">{rup.nama_klpd} - {rup.nama_satker}</div>

      <div className="grid grid-cols-2 gap-2.5 my-4">
        <MiniKpi label="Pagu" value={formatRupiah(rup.pagu)} />
        <MiniKpi label="Mulai Pemilihan" value={`${rup.daysUntilSelection}h`}
          color={rup.daysUntilSelection <= 7 ? '#dc2626' : rup.daysUntilSelection <= 30 ? '#d97706' : '#16a34a'} />
      </div>



      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
          Ringkasan RUP
        </div>
        <div className="flex flex-col">
          {[
            ['Kode RUP', rup.kd_rup],
            ['Datamart ID', rup.datamart_id],
            ['Jenis Pengadaan', rup.jenis_pengadaan],
            ['Status Umumkan', rup.status_umumkan_rup],
            ['PDN / UKM', `${rup.status_pdn} / ${rup.status_ukm}`],
            ['Volume', rup.volume_pekerjaan],
            ['Lokasi', `${rup.kabupaten || ''}, ${rup.provinsi || ''}`],
          ].map(([label, value], i) => (
            <div key={label} className={`grid grid-cols-[130px_1fr] gap-2.5 py-2 ${i > 0 ? 'border-t border-slate-200' : ''}`}>
              <div className="text-[11px] font-extrabold text-slate-500">{label}</div>
              <div className="text-xs font-bold text-slate-800">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Uraian & Spesifikasi
        </div>
        <div className="text-[13px] leading-relaxed bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <strong>Uraian:</strong> {rup.uraian_pekerjaan}<br />
          <strong className="mt-2 inline-block">Spesifikasi:</strong> {rup.spesifikasi_pekerjaan}
        </div>
      </div>

      <div className="mt-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
          Timeline Rencana Pengadaan
        </div>
        
        {/* Visual Timeline */}
        <div className="relative bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          {/* Timeline Line */}
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-200 via-green-200 to-green-400" />
          
          <div className="space-y-6">
            {[
              { 
                label: 'Pemilihan Penyedia', 
                start: rup.tgl_awal_pemilihan, 
                end: rup.tgl_akhir_pemilihan, 
                color: 'blue',
                icon: TrendingUp,
                status: rup.daysUntilSelection > 0 ? 'upcoming' : 'ongoing'
              },
              { 
                label: 'Penandatanganan Kontrak', 
                start: rup.tgl_awal_kontrak, 
                end: rup.tgl_akhir_kontrak, 
                color: 'green',
                icon: CheckCircle,
                status: 'future'
              },
            ].map((phase, idx) => {
              const startDate = phase.start ? new Date(`${phase.start}T00:00:00+07:00`) : null;
              const endDate = phase.end ? new Date(`${phase.end}T00:00:00+07:00`) : null;
              const durationMonths = startDate && endDate 
                ? Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30)))
                : 0;

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    phase.status === 'ongoing' ? 'bg-blue-600 ring-4 ring-blue-100' :
                    phase.status === 'upcoming' ? 'bg-amber-500 ring-4 ring-amber-100' :
                    'bg-slate-300 ring-4 ring-slate-100'
                  }`}>
                    <phase.icon size={16} className="text-white" />
                  </div>

                  {/* Phase Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{phase.label}</div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {durationMonths > 0 ? `${durationMonths} bulan` : 'Durasi belum ditentukan'}
                        </div>
                      </div>
                      <Badge color={phase.color} className="shrink-0">
                        {phase.status === 'ongoing' ? 'Berlangsung' : 
                         phase.status === 'upcoming' ? 'Akan Datang' : 'Mendatang'}
                      </Badge>
                    </div>

                    {/* Date Range */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Mulai
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            <div className="text-xs font-bold text-slate-800">
                              {phase.start ? formatMonthYear(phase.start) : '-'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Selesai
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            <div className="text-xs font-bold text-slate-800">
                              {phase.end ? formatMonthYear(phase.end) : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Keyword Match
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rup.matched?.length
            ? rup.matched.map(k => <Badge key={k} color="green">{k}</Badge>)
            : <Badge color="gray">Tidak ada keyword aktif yang cocok</Badge>
          }
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
          Status Internal
        </div>
        <select 
          value={status} 
          onChange={e => setStatus(e.target.value)} 
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
        >
          {['Dipantau', 'Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah', 'Tidak Relevan'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

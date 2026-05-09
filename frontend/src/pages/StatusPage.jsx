import React, { useMemo, useState } from 'react';
import {
  Inbox, Building2, Users as UsersIcon, LayoutGrid, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Eye, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Badge, CountdownBadge, PageTitle, Card } from '../components/UI/index';
import { formatRupiah } from '../utils/helpers';
import { UNIT_KERJA, UNIT_KERJA_BY_REGION, REGIONS, unitKerjaLabel } from '../utils/unitKerja';

const STATUS_BORDER = {
  'Dipantau':       'border-l-4 border-l-slate-400',
  'Akan Diikuti':   'border-l-4 border-l-amber-500',
  'Sudah Diikuti':  'border-l-4 border-l-blue-500',
  'Menang':         'border-l-4 border-l-green-500',
  'Kalah':          'border-l-4 border-l-red-500',
  'Tidak Relevan':  'border-l-4 border-l-slate-200',
};

const COLOR_MAP = {
  amber: { border: 'border-amber-200', bg: 'bg-amber-50' },
  blue:  { border: 'border-blue-200',  bg: 'bg-blue-50' },
  green: { border: 'border-green-200', bg: 'bg-green-50' },
  red:   { border: 'border-red-200',   bg: 'bg-red-50' },
  gray:  { border: 'border-slate-200', bg: 'bg-slate-50' },
};

const STATUS_DOT = {
  'Akan Diikuti':  'bg-amber-500',
  'Sudah Diikuti': 'bg-blue-500',
  'Menang':        'bg-green-500',
  'Kalah':         'bg-red-500',
  'Dipantau':      'bg-slate-400',
  'Tidak Relevan': 'bg-slate-300',
};

const KanbanCard = React.memo(({ tender, onSelect, statusName }) => (
  <Card
    className={`w-full cursor-pointer hover:shadow-md transition-shadow mb-2 !p-3 h-[185px] min-h-[185px] max-h-[185px] shrink-0 flex flex-col ${STATUS_BORDER[statusName] || ''}`}
    onClick={() => onSelect(tender.id)}
  >
    <h3 className="text-xs font-bold tracking-tight line-clamp-2 mb-1.5 min-h-[32px] break-words whitespace-normal">{tender.nama}</h3>
    <div className="text-slate-500 text-[10px] line-clamp-1 mb-2 break-words whitespace-normal">{tender.instansi}</div>
    <div className="mb-2">
      <div className="text-[9px] text-slate-600 flex flex-wrap items-center">
        <span className="font-semibold whitespace-nowrap">Tahap {tender.currentStage}/{tender.totalStages}</span>
        <span className="text-slate-400 mx-1">•</span>
        <span className="text-slate-500 line-clamp-1 flex-1 min-w-0">{tender.currentStageName}</span>
      </div>
    </div>
    <div className="mb-auto">
      <CountdownBadge dateStr={tender.deadlineStage} days={tender.daysLeft} expired={tender.deadlinePassed} />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">HPS</span>
      <span className="font-bold text-xs text-slate-800">{formatRupiah(tender.hps)}</span>
    </div>
  </Card>
));

const KanbanColumn = React.memo(({ title, color, tenders, onSelect }) => {
  const [limit, setLimit] = React.useState(20);
  const displayTenders = tenders.slice(0, limit);
  const hasMore = tenders.length > limit;
  const theme = COLOR_MAP[color] || COLOR_MAP.gray;

  return (
    <div className="flex-none w-[280px] h-full flex flex-col">
      <div className="flex-none pb-2">
        <div className={`rounded-lg border-2 ${theme.border} ${theme.bg} p-2.5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold tracking-tight">{title}</h2>
            <Badge color={color} size="sm">{tenders.length}</Badge>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {displayTenders.length > 0 ? (
          <>
            {displayTenders.map(t => <KanbanCard key={t.id} tender={t} onSelect={onSelect} statusName={title} />)}
            {hasMore && (
              <div
                className="text-center p-2 text-blue-600 hover:text-blue-800 text-[11px] font-bold cursor-pointer hover:underline"
                onClick={() => setLimit(tenders.length)}
              >
                +{tenders.length - limit} tender lainnya
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-slate-400 text-[10px] border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <Inbox size={20} className="opacity-60" />
            <span className="text-center">Belum ada tender di sini.</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Admin overview ───────────────────────────────────────────────────────────
function AdminOverview({ tenders, tenderClaims, onSelectBranch }) {
  const summary = useMemo(() => {
    const buckets = {};
    UNIT_KERJA.forEach(u => {
      buckets[u.name] = { total: 0, region: u.region, byStatus: {
        'Dipantau': 0, 'Akan Diikuti': 0, 'Sudah Diikuti': 0, 'Menang': 0, 'Kalah': 0, 'Tidak Relevan': 0,
      }};
    });
    let unclaimed = 0;
    tenders.forEach(t => {
      const claim = tenderClaims[t.id];
      if (!claim?.unit_kerja || !buckets[claim.unit_kerja]) { unclaimed++; return; }
      buckets[claim.unit_kerja].total++;
      const s = t.internalStatus || 'Dipantau';
      if (buckets[claim.unit_kerja].byStatus[s] !== undefined) buckets[claim.unit_kerja].byStatus[s]++;
    });
    return { buckets, unclaimed };
  }, [tenders, tenderClaims]);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <UsersIcon size={16} className="text-blue-600" />
        <h3 className="text-sm font-extrabold">Ringkasan Global</h3>
        <span className="ml-auto text-[11px] text-slate-500">{tenders.length} tender total · {summary.unclaimed} belum di-claim</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] uppercase font-bold text-slate-500 bg-slate-50 border-b">
              <th className="px-3 py-2">Unit Kerja</th>
              <th className="px-3 py-2">Wilayah</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Dipantau</th>
              <th className="px-3 py-2 text-right">Akan</th>
              <th className="px-3 py-2 text-right">Sudah</th>
              <th className="px-3 py-2 text-right">Menang</th>
              <th className="px-3 py-2 text-right">Kalah</th>
              <th className="px-3 py-2 text-right">Tidak Relevan</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {UNIT_KERJA.map(u => {
              const b = summary.buckets[u.name];
              return (
                <tr key={u.name} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2 font-bold">{unitKerjaLabel(u.name)}</td>
                  <td className="px-3 py-2 text-slate-500">{u.region}</td>
                  <td className="px-3 py-2 text-right font-extrabold">{b.total}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{b.byStatus['Dipantau']}</td>
                  <td className="px-3 py-2 text-right text-amber-700">{b.byStatus['Akan Diikuti']}</td>
                  <td className="px-3 py-2 text-right text-blue-700">{b.byStatus['Sudah Diikuti']}</td>
                  <td className="px-3 py-2 text-right text-green-700">{b.byStatus['Menang']}</td>
                  <td className="px-3 py-2 text-right text-red-700">{b.byStatus['Kalah']}</td>
                  <td className="px-3 py-2 text-right text-slate-500">{b.byStatus['Tidak Relevan']}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectBranch(u.name)}
                      disabled={b.total === 0}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      Lihat Kanban →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Calendar (month grid) ────────────────────────────────────────────────────
const ID_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const ID_WEEKDAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function ymd(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function parseDateStr(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function CalendarView({ tenders, onSelect }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(null);

  // Index tenders by deadline yyyy-mm-dd.
  const byDay = useMemo(() => {
    const map = {};
    tenders.forEach(t => {
      const d = parseDateStr(t.deadlineStage);
      if (!d) return;
      const key = ymd(d);
      (map[key] = map[key] || []).push(t);
    });
    return map;
  }, [tenders]);

  // Build the 6-row grid (42 cells) starting from Sunday before/at month start.
  const cells = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay()); // back to Sunday
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [cursor]);

  const todayKey = ymd(new Date());
  const monthLabel = `${ID_MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  const selectedItems = selectedDay ? (byDay[selectedDay] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <Card className="!p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setCursor(c => addMonths(c, -1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-sm font-extrabold tracking-tight">{monthLabel}</div>
          <button
            type="button"
            onClick={() => setCursor(c => addMonths(c, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {ID_WEEKDAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase text-slate-500 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const key = ymd(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const items = byDay[key] || [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDay;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(items.length ? key : null)}
                disabled={items.length === 0}
                className={`min-h-[80px] p-1.5 rounded-lg border text-left transition-colors flex flex-col ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' :
                  isToday ? 'border-blue-300 bg-blue-50/40' :
                  inMonth ? 'border-slate-200 bg-white hover:bg-slate-50' :
                  'border-slate-100 bg-slate-50/40 opacity-60'
                } ${items.length === 0 ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className={`text-[11px] font-bold ${isToday ? 'text-blue-700' : inMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                  {d.getDate()}
                </div>
                {items.length > 0 && (
                  <div className="mt-auto flex flex-col gap-0.5">
                    {items.slice(0, 2).map(t => (
                      <div key={t.id} className="flex items-center gap-1 text-[9px]">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[t.internalStatus] || 'bg-slate-400'}`} />
                        <span className="truncate text-slate-700">{t.nama}</span>
                      </div>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[9px] font-bold text-blue-600">+{items.length - 2} lain</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500 font-bold">
          {Object.entries(STATUS_DOT).slice(0, 5).map(([s, cls]) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${cls}`} /> {s}
            </span>
          ))}
        </div>
      </Card>

      <Card className="!p-4 max-h-[600px] overflow-y-auto">
        {selectedDay ? (
          <>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Deadline pada</div>
            <div className="text-sm font-extrabold mb-3">{selectedDay}</div>
            <div className="flex flex-col gap-2">
              {selectedItems.map(t => {
                const stageName = t.deadlineRefStageName || t.currentStageName || 'Tahap tidak diketahui';
                const stageNo = t.deadlineRefStageNo || t.currentStage;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelect(t.id)}
                    className={`text-left p-3 rounded-lg border bg-white hover:bg-slate-50 ${STATUS_BORDER[t.internalStatus] || ''}`}
                  >
                    <div className="text-[12px] font-extrabold leading-snug line-clamp-2">{t.nama}</div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{t.instansi}</div>
                    <div className="mt-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-md">
                      <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Deadline tahap</div>
                      <div className="text-[11px] font-bold text-slate-800 leading-snug">
                        {stageNo ? `Tahap ${stageNo} · ` : ''}{stageName}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge color={
                        t.internalStatus === 'Akan Diikuti' ? 'amber' :
                        t.internalStatus === 'Sudah Diikuti' ? 'blue' :
                        t.internalStatus === 'Menang' ? 'green' :
                        t.internalStatus === 'Kalah' ? 'red' : 'gray'
                      } size="sm">{t.internalStatus || 'Dipantau'}</Badge>
                      <span className="text-[10px] font-bold text-slate-700">{formatRupiah(t.hps)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
            <CalendarIcon size={32} className="mb-2 opacity-50" />
            <div className="text-xs">Klik tanggal di kalender untuk lihat deadline tender hari itu.</div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Statistics view ──────────────────────────────────────────────────────────
const STATUS_FILL = {
  'Akan Diikuti':  '#f59e0b',
  'Sudah Diikuti': '#3b82f6',
  'Menang':        '#10b981',
  'Kalah':         '#ef4444',
  'Tidak Relevan': '#94a3b8',
  'Dipantau':      '#cbd5e1',
};

function StatsView({ tenders, tenderClaims, scope, scopeLabel }) {
  // Tenders relevant to scope already filtered by caller — `tenders` arg.
  // For per-branch chart, we ALWAYS want global breakdown so admin/cabang can
  // compare branches. Pull from `globalTenders` separately when scope = single branch?
  // Simplification: per-branch chart uses the FULL tender list from props.

  // Per-branch counts (only branches with > 0 active tenders).
  const perBranch = useMemo(() => {
    const map = {};
    UNIT_KERJA.forEach(u => { map[u.name] = { name: u.name, total: 0, akan: 0, sudah: 0, menang: 0, kalah: 0 }; });
    tenders.forEach(t => {
      const u = tenderClaims[t.id]?.unit_kerja;
      if (!u || !map[u]) return;
      const s = t.internalStatus;
      if (s === 'Akan Diikuti')   { map[u].akan++;   map[u].total++; }
      else if (s === 'Sudah Diikuti') { map[u].sudah++; map[u].total++; }
      else if (s === 'Menang')        { map[u].menang++; map[u].total++; }
      else if (s === 'Kalah')         { map[u].kalah++;  map[u].total++; }
    });
    return Object.values(map).filter(b => b.total > 0).sort((a, b) => b.total - a.total);
  }, [tenders, tenderClaims]);

  // Per-stage (currentStageName) counts — use scoped tenders only (active statuses).
  const perStage = useMemo(() => {
    const counts = {};
    tenders.forEach(t => {
      if (!['Akan Diikuti', 'Sudah Diikuti', 'Menang', 'Kalah'].includes(t.internalStatus)) return;
      const stage = (t.currentStageName || '—').slice(0, 36);
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 12);
  }, [tenders]);

  // Win/Lose donut — uses scoped tenders.
  const winLose = useMemo(() => {
    const c = { 'Menang': 0, 'Kalah': 0, 'Sudah Diikuti': 0, 'Akan Diikuti': 0 };
    tenders.forEach(t => { if (c[t.internalStatus] !== undefined) c[t.internalStatus]++; });
    return Object.entries(c).map(([name, value]) => ({ name, value, fill: STATUS_FILL[name] }));
  }, [tenders]);

  const totalActive = winLose.reduce((s, r) => s + r.value, 0);
  const winRate = (winLose.find(x => x.name === 'Menang')?.value || 0) /
                  Math.max(1, (winLose.find(x => x.name === 'Menang')?.value || 0) + (winLose.find(x => x.name === 'Kalah')?.value || 0));

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: per-branch bar + win/lose donut */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Tender Diikuti per Unit Kerja</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Stack by status. Hanya tender dengan status aktif (Akan/Sudah/Menang/Kalah).</p>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">{scopeLabel}</span>
          </div>
          {perBranch.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-xs text-slate-400">Belum ada tender aktif yang ter-claim.</div>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perBranch} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <RTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} itemStyle={{ fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="akan"   name="Akan Diikuti"  stackId="a" fill={STATUS_FILL['Akan Diikuti']} />
                  <Bar dataKey="sudah"  name="Sudah Diikuti" stackId="a" fill={STATUS_FILL['Sudah Diikuti']} />
                  <Bar dataKey="menang" name="Menang"        stackId="a" fill={STATUS_FILL['Menang']} />
                  <Bar dataKey="kalah"  name="Kalah"         stackId="a" fill={STATUS_FILL['Kalah']}>
                    <LabelList dataKey="total" position="top" fontSize={10} fontWeight={700} fill="#0f172a" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="!p-4">
          <div className="mb-3">
            <h3 className="text-sm font-extrabold tracking-tight">Menang vs Kalah</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{scopeLabel} · {totalActive} tender aktif</p>
          </div>
          {totalActive === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-xs text-slate-400">Belum ada data.</div>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLose} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {winLose.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <RTooltip contentStyle={{ borderRadius: 12, border: 'none' }} itemStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                {winLose.map(r => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.fill }} />
                      {r.name}
                    </span>
                    <span className="font-extrabold text-slate-900">{r.value}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 mt-2 pt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">Winrate</span>
                  <span className="font-black text-emerald-600">{Math.round(winRate * 100)}%</span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Per-stage horizontal bar */}
      <Card className="!p-4">
        <div className="mb-3">
          <h3 className="text-sm font-extrabold tracking-tight">Distribusi per Tahap Tender</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{scopeLabel} · top 12 tahapan dengan tender aktif terbanyak.</p>
        </div>
        {perStage.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">Belum ada data.</div>
        ) : (
          <div style={{ height: Math.max(220, perStage.length * 30) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perStage} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={220} tick={{ fontSize: 11, fill: '#0f172a' }} />
                <RTooltip contentStyle={{ borderRadius: 12, border: 'none' }} itemStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#3b82f6" name="Jumlah tender">
                  <LabelList dataKey="value" position="right" fontSize={11} fontWeight={700} fill="#0f172a" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StatusPage() {
  const [showIrrelevant, setShowIrrelevant] = useState(false);
  const { tenders, setSelectedTenderId, tenderClaims } = useAppContext();
  const { isAdmin, isPusat, isCabang, unitKerja } = useAuth();

  const [view, setView] = useState('stats');                // 'stats' | 'kanban' | 'calendar' (Statistik default)
  const [adminViewBranch, setAdminViewBranch] = useState(null);
  // Cabang/pusat: optional override branch (read-only when not their own).
  const [overrideBranch, setOverrideBranch] = useState(null);

  // Determine effective branch.
  const ownBranch = unitKerja || null;
  const viewBranch = isAdmin ? adminViewBranch : (overrideBranch || ownBranch);
  const isViewingOther = viewBranch && ownBranch && viewBranch !== ownBranch;
  const readOnly = isAdmin || isViewingOther;

  const filteredTenders = useMemo(() => {
    if (isAdmin && !viewBranch) return tenders;
    if (!viewBranch) return [];
    return tenders.filter(t => tenderClaims[t.id]?.unit_kerja === viewBranch);
  }, [tenders, tenderClaims, viewBranch, isAdmin]);

  const statusBuckets = useMemo(() => ({
    'Akan Diikuti':  filteredTenders.filter(t => t.internalStatus === 'Akan Diikuti'),
    'Sudah Diikuti': filteredTenders.filter(t => t.internalStatus === 'Sudah Diikuti'),
    'Menang':        filteredTenders.filter(t => t.internalStatus === 'Menang'),
    'Kalah':         filteredTenders.filter(t => t.internalStatus === 'Kalah'),
    'Tidak Relevan': filteredTenders.filter(t => t.internalStatus === 'Tidak Relevan'),
  }), [filteredTenders]);

  // Branch picker (admin uses adminViewBranch, others use overrideBranch).
  const renderBranchPicker = () => (
    <select
      value={(isAdmin ? adminViewBranch : overrideBranch) || ''}
      onChange={e => {
        const v = e.target.value || null;
        if (isAdmin) setAdminViewBranch(v); else setOverrideBranch(v);
      }}
      className="px-3 py-2 border border-slate-200 rounded-xl bg-white shadow-sm text-xs font-bold"
    >
      <option value="">{isAdmin ? 'Pilih cabang...' : `Cabang sendiri (${unitKerjaLabel(ownBranch || '')})`}</option>
      {REGIONS.map(region => (
        <optgroup key={region} label={`Wilayah ${region}`}>
          {UNIT_KERJA_BY_REGION[region].map(u => (
            <option key={u} value={u}>{unitKerjaLabel(u)}{u === ownBranch ? ' — milik Anda' : ''}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  // Admin global overview when no branch picked AND not on stats tab.
  if (isAdmin && !adminViewBranch && view !== 'stats') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <PageTitle
            title="Status Tender — Admin Overview"
            subtitle="Ringkasan claim per cabang. Pilih cabang untuk lihat Kanban (read-only) atau klik tab Statistik untuk grafik global."
            right={
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-0 p-0.5 bg-slate-100 rounded-lg">
                  <button type="button" onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${view === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                    <LayoutGrid size={14} /> Kanban
                  </button>
                  <button type="button" onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${view === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                    <CalendarIcon size={14} /> Kalender
                  </button>
                  <button type="button" onClick={() => setView('stats')} className={`px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${view === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                    <BarChart3 size={14} /> Statistik
                  </button>
                </div>
                {renderBranchPicker()}
              </div>
            }
          />
        </div>
        <div className="mt-4">
          <AdminOverview tenders={tenders} tenderClaims={tenderClaims} onSelectBranch={setAdminViewBranch} />
        </div>
      </div>
    );
  }

  // No branch + not admin: prompt assignment.
  if (!viewBranch && !isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <PageTitle title="Status Tender" subtitle="Anda belum di-assign ke unit kerja manapun." />
        </div>
        <Card className="mt-4 p-8 text-center text-slate-500">
          <Building2 size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold">Belum ada unit kerja.</p>
          <p className="text-xs mt-1">Hubungi Admin untuk meng-assign akun Anda ke salah satu cabang atau SBU LSI Pusat.</p>
        </Card>
      </div>
    );
  }

  const subtitleParts = [];
  if (viewBranch) subtitleParts.push(unitKerjaLabel(viewBranch));
  if (isAdmin) subtitleParts.push('admin · read-only');
  else if (isViewingOther) subtitleParts.push('mode pantau cabang lain · read-only');
  else subtitleParts.push('cabang Anda');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageTitle
          title="Status Tender"
          subtitle={subtitleParts.join(' · ')}
          right={
            <div className="flex flex-wrap items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-0 p-0.5 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setView('kanban')}
                  className={`px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${view === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <LayoutGrid size={14} /> Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  className={`px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${view === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <CalendarIcon size={14} /> Kalender
                </button>
                <button
                  type="button"
                  onClick={() => setView('stats')}
                  className={`px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 ${view === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  <BarChart3 size={14} /> Statistik
                </button>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setAdminViewBranch(null)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white shadow-sm text-xs font-bold text-blue-600 hover:bg-blue-50"
                >
                  ← Overview
                </button>
              )}

              {renderBranchPicker()}

              {!isAdmin && overrideBranch && overrideBranch !== ownBranch && (
                <button
                  type="button"
                  onClick={() => setOverrideBranch(null)}
                  className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-blue-600 hover:bg-blue-50"
                >
                  ← Cabang sendiri
                </button>
              )}

              {view === 'kanban' && (
                <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white shadow-sm">
                  <input
                    id="kanbanShowIrrelevant"
                    type="checkbox"
                    checked={showIrrelevant}
                    onChange={e => setShowIrrelevant(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="kanbanShowIrrelevant" className="text-xs font-extrabold text-slate-700 cursor-pointer">
                    Tampilkan "Tidak Relevan"
                  </label>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* Read-only banner when viewing other branch. */}
      {readOnly && viewBranch && (
        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-semibold">
          <Eye size={14} />
          Mode read-only — Anda sedang melihat data {unitKerjaLabel(viewBranch)}{!isAdmin ? '. Hanya pemilik atau admin yang bisa mengubah.' : '.'}
        </div>
      )}

      {view === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 mt-4">
          <div className="flex gap-4 h-full pb-4 w-max min-w-full">
            <KanbanColumn title="Akan Diikuti"  color="amber" tenders={statusBuckets['Akan Diikuti']}  onSelect={setSelectedTenderId} />
            <KanbanColumn title="Sudah Diikuti" color="blue"  tenders={statusBuckets['Sudah Diikuti']} onSelect={setSelectedTenderId} />
            <KanbanColumn title="Menang"        color="green" tenders={statusBuckets['Menang']}        onSelect={setSelectedTenderId} />
            <KanbanColumn title="Kalah"         color="red"   tenders={statusBuckets['Kalah']}         onSelect={setSelectedTenderId} />
            {showIrrelevant && (
              <KanbanColumn title="Tidak Relevan" color="gray" tenders={statusBuckets['Tidak Relevan']} onSelect={setSelectedTenderId} />
            )}
          </div>
        </div>
      ) : view === 'calendar' ? (
        <div className="mt-4">
          <CalendarView tenders={filteredTenders} onSelect={setSelectedTenderId} />
        </div>
      ) : (
        <div className="mt-4">
          <StatsView
            tenders={view === 'stats' && (isAdmin && !adminViewBranch) ? tenders : filteredTenders}
            tenderClaims={tenderClaims}
            scope={viewBranch || 'all'}
            scopeLabel={viewBranch ? unitKerjaLabel(viewBranch) : 'Semua Cabang + Pusat'}
          />
        </div>
      )}
    </div>
  );
}

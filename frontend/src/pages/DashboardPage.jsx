import React, { useMemo, useState } from 'react';
import { FileText, Target, TrendingUp, Clock, BarChart2, X, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge } from '../components/UI/index';
import { KpiCard } from '../components/UI/index';
import UrgentTenderPanel from '../components/Tender/UrgentPanel';
import KeywordManagerPanel from '../components/Tender/KeywordManager';
import WinrateChart from '../components/Dashboard/WinrateChart';
import { portfolioColor } from '../utils/constants';
import { formatRupiah } from '../utils/helpers';
import { UNIT_KERJA_BY_REGION, REGIONS, unitKerjaLabel } from '../utils/unitKerja';

export default function DashboardPage() {
  const {
    tenders, totalPotensi, relevantCount, urgentCount,
    setSelectedTenderId,
    setShowWinrateDetail, setShowPotensiChart, setShowUrgentPanel,
    setDashboardChartFilter,
    internalStatuses,
    tenderClaims,
  } = useAppContext();
  const { unitKerja: viewerUnit } = useAuth();
  const navigate = useNavigate();
  const [showPotensiSidebar, setShowPotensiSidebar] = useState(false);
  // 'all' | 'mine' | <unit_kerja name>
  const [winrateScope, setWinrateScope] = useState(viewerUnit ? 'mine' : 'all');

  // Resolve scope -> set of unit_kerja names to include (null = all).
  const winrateUnitFilter = useMemo(() => {
    if (winrateScope === 'all') return null;
    if (winrateScope === 'mine') return viewerUnit ? new Set([viewerUnit]) : null;
    return new Set([winrateScope]);
  }, [winrateScope, viewerUnit]);

  const winrateTenders = useMemo(() => {
    if (!winrateUnitFilter) return tenders;
    return tenders.filter(t => {
      const u = tenderClaims[t.id]?.unit_kerja;
      return u && winrateUnitFilter.has(u);
    });
  }, [tenders, tenderClaims, winrateUnitFilter]);

  const winrateScopeLabel = winrateScope === 'all'
    ? 'Semua Cabang + Pusat'
    : winrateScope === 'mine'
    ? (viewerUnit ? unitKerjaLabel(viewerUnit) : 'Semua')
    : unitKerjaLabel(winrateScope);

  const byPortfolio = useMemo(() =>
    ['FLP', 'SDA', 'FITI'].map(p => ({
      p,
      list: tenders.filter(t => t.recommendation === p),
    })), [tenders]);

  const top20Potensi = useMemo(() => {
    return [...tenders]
      .sort((a, b) => (b.hps || 0) - (a.hps || 0))
      .slice(0, 20);
  }, [tenders]);
  
  const pieData = useMemo(() => {
    return byPortfolio.map(item => ({
      name: item.p,
      value: item.list.reduce((sum, t) => sum + (t.hps || 0), 0),
      color: item.p === 'SDA' ? '#0ea5e9' : item.p === 'FLP' ? '#f59e0b' : '#10b981'
    })).filter(item => item.value > 0);
  }, [byPortfolio]);

  const instansiRows = useMemo(() => {
    const counts = tenders.reduce((acc, t) => {
      if (!t.instansi) return acc;
      return { ...acc, [t.instansi]: (acc[t.instansi] || 0) + 1 };
    }, {});
    return Object.entries(counts).map(([instansi, jumlah]) => ({ instansi, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah).slice(0, 10);
  }, [tenders]);

  const maxInstansi = Math.max(...instansiRows.map(p => p.jumlah), 1);
  
  // Calculate winrate from filtered tender data with internal status
  const followed = winrateTenders.filter(t =>
    t.internalStatus === 'Sudah Diikuti' ||
    t.internalStatus === 'Menang' ||
    t.internalStatus === 'Kalah'
  ).length;
  const won  = winrateTenders.filter(t => t.internalStatus === 'Menang').length;
  const lost = winrateTenders.filter(t => t.internalStatus === 'Kalah').length;
  const winrate = followed > 0 ? Math.round((won / followed) * 100) : 0;
  
  // Generate winrate series from actual data (mock quarterly data for now)
  const winrateRows = useMemo(() => {
    // For now, use mock data but calculate from actual tender statuses
    // In production, this would be calculated from historical data with timestamps
    const totalFollowed = followed;
    const totalWon = won;
    
    // Distribute across quarters (mock distribution)
    const iQ1 = Math.floor(totalFollowed * 0.15);
    const iQ2 = Math.floor(totalFollowed * 0.15);
    const iQ3 = Math.floor(totalFollowed * 0.2);
    const iQ4 = Math.floor(totalFollowed * 0.15);
    const iQ1_26 = Math.floor(totalFollowed * 0.15);
    const iQ2_26 = totalFollowed - iQ1 - iQ2 - iQ3 - iQ4 - iQ1_26;

    const wQ1 = Math.floor(totalWon * 0.1);
    const wQ2 = Math.floor(totalWon * 0.2);
    const wQ3 = Math.floor(totalWon * 0.25);
    const wQ4 = Math.floor(totalWon * 0.1);
    const wQ1_26 = Math.floor(totalWon * 0.15);
    const wQ2_26 = totalWon - wQ1 - wQ2 - wQ3 - wQ4 - wQ1_26;

    return [
      { label: 'Q1 2025', ikut: iQ1, menang: wQ1 },
      { label: 'Q2 2025', ikut: iQ2, menang: wQ2 },
      { label: 'Q3 2025', ikut: iQ3, menang: wQ3 },
      { label: 'Q4 2025', ikut: iQ4, menang: wQ4 },
      { label: 'Q1 2026', ikut: iQ1_26, menang: wQ1_26 },
      { label: 'Q2 2026', ikut: iQ2_26, menang: wQ2_26 },
    ].map(row => ({
      ...row,
      rate: row.ikut > 0 ? Math.round((row.menang / row.ikut) * 100) : 0,
    }));
  }, [followed, won]);
  
  const maxWinrateVolume = Math.max(...winrateRows.map(row => row.ikut), 1);
  const bestWinrate = winrateRows.reduce((best, row) => row.rate > best.rate ? row : best, winrateRows[0]);
  const seriesFollowed = winrateRows.reduce((sum, row) => sum + row.ikut, 0);
  const seriesWon = winrateRows.reduce((sum, row) => sum + row.menang, 0);

  // Generate recent activity from actual tender data
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Tender baru (currentStage === 1)
    const newTenders = tenders.filter(t => t.currentStage === 1).slice(0, 2);
    newTenders.forEach(t => {
      activities.push({
        tenderId: t.id,
        text: `Tender baru: ${t.nama.substring(0, 60)}${t.nama.length > 60 ? '...' : ''}`,
        time: '2 jam lalu',
        color: 'blue'
      });
    });

    // Deadline mendekat (daysLeft <= 3)
    const urgentTenders = tenders.filter(t => t.daysLeft >= 0 && t.daysLeft <= 3).slice(0, 2);
    urgentTenders.forEach(t => {
      activities.push({
        tenderId: t.id,
        text: `Deadline mendekat: ${t.nama.substring(0, 60)}${t.nama.length > 60 ? '...' : ''}`,
        time: `${t.daysLeft} hari lagi`,
        color: 'red'
      });
    });

    // Tender yang sedang diikuti (internalStatuses)
    const followedTenders = tenders.filter(t => 
      internalStatuses[t.id] === 'Sudah Diikuti' || internalStatuses[t.id] === 'Akan Diikuti'
    ).slice(0, 2);
    followedTenders.forEach(t => {
      activities.push({
        tenderId: t.id,
        text: `${internalStatuses[t.id]}: ${t.nama.substring(0, 50)}${t.nama.length > 50 ? '...' : ''}`,
        time: '1 hari lalu',
        color: 'green'
      });
    });

    return activities.slice(0, 6);
  }, [tenders, internalStatuses]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-[28px] font-black tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-[14px] font-medium mt-1">
          Ringkasan tender aktif, peluang portofolio, aktivitas terbaru, dan performa winrate SBU LSI.
        </p>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="TOTAL TENDER AKTIF"
          value={tenders.length}
          sub="semua sumber LPSE"
          icon={FileText}
          color="#2563eb" bg="#eff6ff"
          onClick={() => { setDashboardChartFilter({ mode: 'all', portfolio: null }); navigate('/tender'); }}
        />

        <KpiCard
          label="TENDER SESUAI KEYWORD"
          value={relevantCount}
          sub="berdasarkan keyword aktif"
          icon={Target}
          color="#16a34a" bg="#f0fdf4"
          onClick={() => { setDashboardChartFilter({ mode: 'relevant', portfolio: null }); navigate('/tender'); }}
        />

        <KpiCard
          label="NILAI POTENSI TOTAL"
          value={formatRupiah(totalPotensi)}
          sub="akumulasi nilai HPS"
          icon={TrendingUp}
          color="#9333ea" bg="#faf5ff"
          onClick={() => setShowPotensiSidebar(true)}
        />

        <KpiCard
          label="DEADLINE <= 7 HARI"
          value={urgentCount}
          sub="butuh follow-up cepat"
          icon={Clock}
          color="#dc2626" bg="#fef2f2"
          onClick={() => { setDashboardChartFilter({ mode: 'urgent', portfolio: null }); navigate('/tender'); }}
        />
      </div>

      {/* Portfolio Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byPortfolio.map(row => (
          <div
            key={row.p}
            className="bg-white rounded-2xl p-4 border-2 border-slate-100/50 shadow-sm flex justify-between items-end hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              setDashboardChartFilter({ mode: 'portfolio', portfolio: row.p });
              navigate('/tender');
            }}
          >
            <div>
              <Badge color={portfolioColor[row.p]} className="text-[9px] font-black px-2 py-0.5 mb-4">{row.p}</Badge>
              <div className="text-[28px] font-black text-slate-900 leading-none">{row.list.length}</div>
              <div className="text-slate-500 text-[12px] font-bold mt-1">tender aktif</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">POTENSI</div>
              <div className="text-[16px] font-black text-slate-900">
                {formatRupiah(row.list.reduce((sum, t) => sum + (t.hps || 0), 0))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity — Vertical Timeline */}
        <div className="bg-white rounded-3xl border-2 border-slate-100/50 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Clock size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-slate-900">Recent Activity</h2>
                <p className="text-slate-500 text-[12px] font-bold">Aktivitas monitoring terbaru</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Live</span>
            </div>
          </div>

          {/* Micro-legend explaining dot colors. */}
          <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-slate-500">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Tender baru</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Deadline mendekat</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Sedang diikuti</span>
          </div>

          <div className="flex flex-col gap-1">
            {recentActivity.map((item, i) => {
              const dotColor = item.color === 'red' ? 'bg-red-500' : item.color === 'green' ? 'bg-emerald-500' : 'bg-blue-500';
              const dotBg = item.color === 'red' ? 'bg-red-50' : item.color === 'green' ? 'bg-emerald-50' : 'bg-blue-50';
              
              return (
                <div key={i} className="relative flex items-start gap-4 group">
                  {/* Timeline line */}
                  {i < recentActivity.length - 1 && (
                    <div className="absolute left-[19px] top-[32px] w-[1.5px] h-[calc(100%-12px)] bg-slate-100" />
                  )}
                  
                  {/* Icon dot */}
                  <div className={`relative z-10 w-[40px] h-[40px] rounded-full ${dotBg} flex items-center justify-center shrink-0`}>
                    <div className={`w-3 h-3 rounded-full ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                  </div>
                  
                  {/* Content */}
                  <div
                    className="flex-1 py-2 cursor-pointer"
                    onClick={() => setSelectedTenderId(item.tenderId)}
                  >
                    <div className="text-[13px] font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.text}
                    </div>
                    <div className="text-slate-400 text-[11px] font-bold mt-1">
                      {item.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Winrate Chart with embedded branch filter (single container). */}
        <WinrateChart
          winrateRows={winrateRows}
          winrate={winrate}
          followed={followed}
          won={won}
          scopeLabel={winrateScopeLabel}
          filterSlot={
            <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <Building2 size={14} className="text-blue-600" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">Filter cabang</span>
              <select
                value={winrateScope}
                onChange={e => setWinrateScope(e.target.value)}
                className="ml-auto text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
              >
                {viewerUnit && <option value="mine">Cabang Anda — {unitKerjaLabel(viewerUnit)}</option>}
                <option value="all">Semua Cabang + Pusat</option>
                {REGIONS.map(region => (
                  <optgroup key={region} label={`Wilayah ${region}`}>
                    {UNIT_KERJA_BY_REGION[region].map(u => (
                      <option key={u} value={u}>{unitKerjaLabel(u)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          }
        />
      </div>

      {/* Per Instansi */}
      <div className="bg-white rounded-3xl border-2 border-slate-100/50 p-6 shadow-sm mt-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-black text-slate-900">Distribusi Tender per Instansi</h2>
          <div className="text-blue-600">
            <BarChart2 size={20} />
          </div>
        </div>
        <div className="space-y-4">
          {instansiRows.map(row => (
            <div key={row.instansi}
              className="grid grid-cols-[180px_1fr_40px] gap-4 items-center cursor-pointer group"
              onClick={() => {
                setDashboardChartFilter({ mode: 'instansi', instansi: row.instansi });
                navigate('/tender');
              }}>
              <div className="text-[12px] font-bold text-slate-600 group-hover:text-blue-600 transition-colors truncate" title={row.instansi}>
                {row.instansi}
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700 group-hover:brightness-110" 
                  style={{ width: `${row.jumlah / maxInstansi * 100}%` }} 
                />
              </div>
              <div className="text-[12px] font-black text-right text-slate-900">{row.jumlah}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Potensi Sidebar */}
      {showPotensiSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
            onClick={() => setShowPotensiSidebar(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col animate-slideInRight border-l border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
              <div>
                <h2 className="text-lg font-black text-slate-900">Nilai Potensial HPS</h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">Top 20 Tender & Portofolio</p>
              </div>
              <button 
                onClick={() => setShowPotensiSidebar(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="mb-6">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Sebaran Portofolio</h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value) => formatRupiah(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs font-bold text-slate-700">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Top 20 Proyek (HPS)</h3>
                <div className="flex flex-col gap-2.5">
                  {top20Potensi.map((t, i) => (
                    <div key={t.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-white hover:border-blue-200 transition-colors hover:shadow-sm cursor-pointer group" onClick={() => { setShowPotensiSidebar(false); setSelectedTenderId(t.id); }}>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] font-black text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            {i + 1}
                          </span>
                          <Badge color={portfolioColor[t.recommendation]}>{t.recommendation}</Badge>
                        </div>
                        <div className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                          {formatRupiah(t.hps)}
                        </div>
                      </div>
                      <div className="text-[12px] font-bold text-slate-700 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{t.nama}</div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">{t.instansi}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

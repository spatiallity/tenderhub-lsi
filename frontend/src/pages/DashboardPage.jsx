import React, { useMemo } from 'react';
import { FileText, Target, TrendingUp, Clock, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Card, Badge } from '../components/UI/index';
import { KpiCard } from '../components/UI/index.jsx';
import { portfolioColor } from '../utils/constants';
import { formatRupiah } from '../utils/helpers';

export default function DashboardPage() {
  const {
    tenders, totalPotensi, relevantCount, urgentCount,
    setSelectedTenderId,
    setShowWinrateDetail, setShowPotensiChart, setShowUrgentPanel,
    setDashboardChartFilter,
    internalStatuses,
  } = useAppContext();
  const navigate = useNavigate();

  const byPortfolio = useMemo(() =>
    ['FLP', 'SDA', 'FITI'].map(p => ({
      p,
      list: tenders.filter(t => t.recommendation === p),
    })), [tenders]);

  const instansiRows = useMemo(() => {
    const counts = tenders.reduce((acc, t) => {
      if (!t.instansi) return acc;
      return { ...acc, [t.instansi]: (acc[t.instansi] || 0) + 1 };
    }, {});
    return Object.entries(counts).map(([instansi, jumlah]) => ({ instansi, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah).slice(0, 10);
  }, [tenders]);

  const maxInstansi = Math.max(...instansiRows.map(p => p.jumlah), 1);
  
  // Calculate winrate from actual tender data with internal status
  const followed = tenders.filter(t => 
    t.internalStatus === 'Sudah Diikuti' || 
    t.internalStatus === 'Menang' || 
    t.internalStatus === 'Kalah'
  ).length;
  const won = tenders.filter(t => t.internalStatus === 'Menang').length;
  const lost = tenders.filter(t => t.internalStatus === 'Kalah').length;
  const winrate = followed > 0 ? Math.round((won / followed) * 100) : 0;
  
  // Generate winrate series from actual data (mock quarterly data for now)
  const winrateRows = useMemo(() => {
    // For now, use mock data but calculate from actual tender statuses
    // In production, this would be calculated from historical data with timestamps
    const totalFollowed = followed;
    const totalWon = won;
    
    // Distribute across quarters (mock distribution)
    const iQ1 = Math.floor(totalFollowed * 0.2);
    const iQ2 = Math.floor(totalFollowed * 0.25);
    const iQ3 = Math.floor(totalFollowed * 0.25);
    const iQ4 = Math.floor(totalFollowed * 0.2);
    const iYTD = totalFollowed - iQ1 - iQ2 - iQ3 - iQ4;

    const wQ1 = Math.floor(totalWon * 0.2);
    const wQ2 = Math.floor(totalWon * 0.25);
    const wQ3 = Math.floor(totalWon * 0.25);
    const wQ4 = Math.floor(totalWon * 0.2);
    const wYTD = totalWon - wQ1 - wQ2 - wQ3 - wQ4;

    return [
      { label: 'Q1 2025', ikut: iQ1, menang: wQ1 },
      { label: 'Q2 2025', ikut: iQ2, menang: wQ2 },
      { label: 'Q3 2025', ikut: iQ3, menang: wQ3 },
      { label: 'Q4 2025', ikut: iQ4, menang: wQ4 },
      { label: 'YTD 2026', ikut: iYTD, menang: wYTD },
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start gap-4 mb-1">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-[13px] mt-1 max-w-2xl">
            Ringkasan tender aktif, peluang portofolio, aktivitas terbaru, dan performa winrate SBU LSI.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="TOTAL TENDER AKTIF"
          value={tenders.length}
          sub="semua sumber LPSE"
          icon={FileText}
          color="#2563eb" bg="#eff6ff"
          onClick={() => { setDashboardChartFilter({ mode: 'all', portfolio: null }); setShowPotensiChart(true); }}
        />

        <KpiCard
          label="TENDER SESUAI KEYWORD"
          value={relevantCount}
          sub="berdasarkan keyword aktif"
          icon={Target}
          color="#16a34a" bg="#f0fdf4"
          onClick={() => { setDashboardChartFilter({ mode: 'relevant', portfolio: null }); setShowPotensiChart(true); }}
        />

        <KpiCard
          label="NILAI POTENSI TOTAL"
          value={formatRupiah(totalPotensi)}
          sub="akumulasi nilai HPS"
          icon={TrendingUp}
          color="#9333ea" bg="#faf5ff"
          onClick={() => { setDashboardChartFilter({ mode: 'all', portfolio: null }); setShowPotensiChart(true); }}
        />

        <KpiCard
          label="DEADLINE <= 7 HARI"
          value={urgentCount}
          sub="butuh follow-up cepat"
          icon={Clock}
          color="#dc2626" bg="#fef2f2"
          onClick={() => { setDashboardChartFilter({ mode: 'urgent', portfolio: null }); setShowUrgentPanel(true); }}
        />
      </div>

      {/* Portfolio Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {byPortfolio.map(row => (
          <div
            key={row.p}
            className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-row justify-between"
            onClick={() => {
              setDashboardChartFilter({ mode: 'portfolio', portfolio: row.p });
              setShowPotensiChart(true);
            }}
          >
            <div className="flex flex-col justify-between">
              <Badge color={portfolioColor[row.p]} className="text-[11px] font-bold w-fit mb-5 px-3">{row.p}</Badge>
              <div>
                <div className="text-[28px] font-black leading-none text-slate-900">{row.list.length}</div>
                <div className="text-slate-500 text-[12px] font-medium mt-1.5">tender aktif</div>
              </div>
            </div>
            <div className="flex flex-col justify-end text-right">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-1.5">POTENSI</div>
              <div className="font-black text-[18px] text-slate-900">
                {formatRupiah(row.list.reduce((sum, t) => sum + (t.hps || 0), 0))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Recent Activity — Premium Vertical Timeline */}
        <Card className="border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/40 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
                <Clock size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900">Recent Activity</h2>
                <p className="text-slate-500 text-[11px]">Aktivitas monitoring terbaru</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Live</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {recentActivity.map((item, i) => {
              const iconColor = item.color === 'red' ? 'from-red-500 to-rose-600' : item.color === 'amber' ? 'from-amber-500 to-orange-600' : item.color === 'green' ? 'from-emerald-500 to-green-600' : 'from-blue-500 to-indigo-600';
              const bgHover = item.color === 'red' ? 'hover:bg-red-50/60' : item.color === 'amber' ? 'hover:bg-amber-50/60' : item.color === 'green' ? 'hover:bg-emerald-50/60' : 'hover:bg-blue-50/60';
              const iconBg = item.color === 'red' ? 'bg-red-50' : item.color === 'amber' ? 'bg-amber-50' : item.color === 'green' ? 'bg-emerald-50' : 'bg-blue-50';
              return (
                <div key={i} className="relative flex items-start gap-3 group">
                  {/* Timeline line */}
                  {i < recentActivity.length - 1 && (
                    <div className="absolute left-[15px] top-[32px] w-[2px] h-[calc(100%-8px)] bg-gradient-to-b from-slate-200 to-slate-100" />
                  )}
                  {/* Icon dot */}
                  <div className={`relative z-10 w-[32px] h-[32px] rounded-full ${iconBg} flex items-center justify-center shrink-0 ring-[3px] ring-white shadow-sm`}>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${iconColor}`} />
                  </div>
                  {/* Content */}
                  <div
                    className={`flex-1 rounded-xl px-3.5 py-2.5 cursor-pointer transition-all duration-200 ${bgHover} hover:shadow-sm`}
                    onClick={() => setSelectedTenderId(item.tenderId)}
                  >
                    <div className="text-[12px] font-bold leading-snug text-slate-800 group-hover:text-slate-900">{item.text}</div>
                    <div className="text-slate-400 text-[11px] mt-1 font-medium">{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Winrate Chart — Single Informative Bar Chart */}
        <Card className="cursor-pointer hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/80 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md" onClick={() => setShowWinrateDetail(true)}>
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <BarChart2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Performa Winrate</h2>
                <p className="text-slate-500 text-[12px] mt-0.5">Statistik tender yang diikuti vs dimenangkan per periode</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Overall Winrate</div>
              <div className="text-3xl font-black text-emerald-600 leading-none">{winrate}%</div>
            </div>
          </div>
          
          {/* Single Bar Chart Layout */}
          <div className="w-full flex items-end justify-between h-[180px] pb-3 border-b border-slate-100 px-2 relative">
            {winrateRows.map((row, i) => {
              const maxVol = Math.max(maxWinrateVolume, 1);
              const ikutH = Math.max((row.ikut / maxVol) * 140, row.ikut > 0 ? 10 : 0);
              const menangH = Math.max((row.menang / maxVol) * 140, row.menang > 0 ? 10 : 0);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 relative group">
                  {/* Hover Overlay Background */}
                  <div className="absolute -inset-x-2 -top-10 bottom-0 bg-slate-50/50 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                  
                  {/* Floating Winrate Label */}
                  <div className="absolute -top-6 text-[12px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {row.rate}% Win
                  </div>

                  <div className="flex items-end justify-center gap-2 w-full relative z-10" style={{ height: 140 }}>
                    {/* Ikut bar */}
                    <div className="w-full max-w-[32px] rounded-t-md bg-blue-100 transition-all duration-500 relative group/bar" style={{ height: ikutH }}>
                      <div className="absolute bottom-0 w-full rounded-t-md bg-blue-500 transition-all duration-500" style={{ height: ikutH }} />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-200 z-20 pointer-events-none">{row.ikut}</div>
                    </div>
                    {/* Menang bar */}
                    <div className="w-full max-w-[32px] rounded-t-md bg-emerald-100 transition-all duration-500 relative group/bar" style={{ height: menangH }}>
                      <div className="absolute bottom-0 w-full rounded-t-md bg-emerald-500 transition-all duration-500" style={{ height: menangH }} />
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-200 z-20 pointer-events-none">{row.menang}</div>
                    </div>
                  </div>
                  <span className="text-[12px] font-extrabold text-slate-500 tracking-wide relative z-10">{row.label}</span>
                </div>
              );
            })}
          </div>

          {/* Legend & Summary Stats */}
          <div className="mt-5 flex flex-wrap sm:flex-nowrap gap-4">
            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-blue-500" />
                  <span className="text-[13px] font-bold text-slate-700">Diikuti ({seriesFollowed})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
                  <span className="text-[13px] font-bold text-slate-700">Menang ({seriesWon})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-slate-300" />
                  <span className="text-[13px] font-bold text-slate-600">Kalah ({lost})</span>
                </div>
              </div>
              <div className="text-[12px] text-slate-500 font-medium">
                Dari total {seriesFollowed} tender yang diikuti sepanjang periode, {seriesWon} berhasil dimenangkan. Arahkan kursor ke grafik untuk melihat detail per periode.
              </div>
            </div>
            
            <div className="w-full sm:w-[180px] shrink-0 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/60 px-5 py-4 text-center flex flex-col justify-center shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/80 mb-1">Periode Terbaik</div>
              <div className="text-lg font-black text-amber-900 leading-tight">{bestWinrate.label}</div>
              <div className="text-[12px] font-bold text-amber-700 mt-1">{bestWinrate.rate}% Winrate</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribusi Instansi */}
      <Card>
        <div className="flex justify-between items-center mb-3.5">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Distribusi Tender per Instansi</h2>
            <p className="text-slate-500 text-xs mt-0.5">Klik bar untuk memfilter halaman Tender Intelligence.</p>
          </div>
          <BarChart2 size={18} className="text-blue-600" />
        </div>
        <div className="flex flex-col gap-2.5">
          {instansiRows.map(row => (
            <div key={row.instansi}
              className="grid grid-cols-[170px_1fr_30px] gap-3 items-center cursor-pointer group"
              onClick={() => {
                setDashboardChartFilter({ mode: 'instansi', instansi: row.instansi });
                navigate('/tender');
              }}>
              <div className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600 transition-colors truncate" title={row.instansi}>{row.instansi}</div>
              <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all group-hover:brightness-110" style={{ width: `${row.jumlah / maxInstansi * 100}%` }} />
              </div>
              <div className="text-xs font-extrabold text-right">{row.jumlah}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Target, Calendar, ListChecks, 
  Users, Settings, ChevronLeft, ChevronRight, Menu, X,
  Bell, User
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import Header from './Header';
import TenderDetail from '../Tender/TenderDetail';
import RupDetail from '../UI/RupDetail';
import ExpertDetail from '../Expert/ExpertDetail';
import SidePanel from '../UI/SidePanel';
import PotensiChartPanel from '../Tender/PotensiChartPanel';
import UrgentPanel from '../Tender/UrgentPanel';
import WinrateDetail from '../Tender/WinrateDetail';
import KeywordManagerPanel from '../Keyword/KeywordManagerPanel';
import GlobalSearch from '../UI/GlobalSearch';
import SkipToContent from '../UI/SkipToContent';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedTenderId, setSelectedTenderId, tenders,
    selectedRupId, setSelectedRupId, rupList,
    selectedExpertId, setSelectedExpertId, experts,
    showPotensiChart, setShowPotensiChart,
    showUrgentPanel, setShowUrgentPanel,
    showWinrateDetail, setShowWinrateDetail,
    showKeywordManager, setShowKeywordManager,
    dashboardChartFilter,
    newTenderCount,
    newRupCount,
  } = useAppContext();
  
  // Global keyboard shortcut: Cmd+K or Ctrl+K for search
  useKeyboardShortcut('k', () => setShowGlobalSearch(true), { meta: true, ctrl: true });

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-open sidebar on desktop, auto-close on mobile
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // Close sidebar on navigation (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems = [
    { section: 'Utama', items: [
      { id: '/', icon: Home, label: 'Dashboard', tooltip: 'Ringkasan KPI, aktivitas terbaru, dan performa tender.' },
      { id: '/rup', icon: Calendar, label: 'RUP Pipeline', badge: newRupCount || 0, tooltip: 'Radar awal paket RUP sebelum naik menjadi tender.' },
      { id: '/tender', icon: Target, label: 'Tender Intelligence', badge: newTenderCount || 0, tooltip: 'Daftar tender aktif berbasis keyword, filter, dan prioritas follow-up.' },
      { id: '/status', icon: ListChecks, label: 'Status Tender', tooltip: 'Pantau progres tender yang Akan/Sudah Diikuti.' },
    ]},
    { section: 'Support Layanan Pusat', items: [
      { id: '/experts', icon: Users, label: 'Tenaga Ahli', tooltip: 'Kelola database tenaga ahli, ketersediaan, dan riwayat pekerjaan.' },
      { id: '/settings', icon: Settings, label: 'Pengaturan', tooltip: 'Atur keyword, threshold, coverage wilayah, dan pengguna.' },
    ]}
  ];

  const selectedTender = tenders?.find(t => t.id === selectedTenderId);
  const selectedRup = rupList?.find(r => r.id === selectedRupId);
  const selectedExpert = experts?.find(e => e.id === selectedExpertId);
  const chartTenders = (tenders || []).filter(t => {
    if (dashboardChartFilter?.mode === 'relevant') return (t.matched || []).length > 0;
    if (dashboardChartFilter?.mode === 'urgent') return t.daysLeft <= 7 && t.daysLeft >= 0;
    if (dashboardChartFilter?.mode === 'portfolio' && dashboardChartFilter?.portfolio) {
      return t.recommendation === dashboardChartFilter.portfolio;
    }
    return true;
  });

  // Handle backdrop click (mobile only)
  const handleBackdropClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Skip to Content Link (Accessibility) */}
      <SkipToContent />
      
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-[240px]' : 'w-[68px]'
        } ${
          isMobile 
            ? sidebarOpen 
              ? 'translate-x-0 shadow-2xl' 
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo & Toggle */}
          <div className={`flex items-start justify-between mb-8 ${sidebarOpen ? '' : 'justify-center items-center flex-col'}`}>
            <div className={`overflow-hidden transition-all duration-300 flex flex-col ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
              {/* TenderHub Title */}
              <div>
                <div className="text-[20px] font-black tracking-tight leading-tight">
                  <span className="text-blue-600">Tender</span>
                  <span style={{ color: '#13B2AA' }}>Hub</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Toggle */}
            {!isMobile && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ${sidebarOpen ? 'mt-8' : ''}`}
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
            
            {/* Mobile Close */}
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 md:hidden"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-1" style={{ scrollbarWidth: 'none' }}>
            {navItems.map((group, idx) => (
              <div key={idx} className="mb-2">
                {group.section !== 'Utama' && sidebarOpen && (
                  <div className="px-3 mb-2 mt-4 text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
                    {group.section}
                  </div>
                )}
                {group.items.map(item => {
                  const active = location.pathname === item.id || (item.id !== '/' && location.pathname.startsWith(item.id));
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`flex items-center ${sidebarOpen ? 'gap-4 px-4' : 'justify-center px-0'} py-3 rounded-xl transition-all duration-200 relative group w-full mb-1 ${
                        active 
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' 
                          : 'bg-transparent text-slate-600 hover:bg-slate-50 font-semibold'
                      }`}
                      title={!sidebarOpen ? item.label : item.tooltip}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                    >
                      <item.icon size={20} className={`shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                      <span className={`text-[13px] transition-all duration-300 flex-1 text-left leading-snug ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                        {item.label}
                      </span>
                      {item.badge > 0 && (
                        <span 
                          className={`shrink-0 rounded-full flex items-center justify-center font-extrabold leading-none transition-all duration-300 ${
                            active ? 'bg-white text-blue-600' : 'bg-red-600 text-white'
                          } ${
                            sidebarOpen 
                              ? 'min-w-[24px] h-[24px] px-1.5 text-[11px]' 
                              : 'absolute top-1.5 right-1.5 min-w-[20px] h-[20px] px-1 text-[9px] ring-2 ring-white'
                          }`}
                          aria-label={`${item.badge} new items`}
                        >
                          {!sidebarOpen && item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Copyright Footer */}
          <div className={`mt-auto pt-4 border-t border-slate-100 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
            <div className="text-[9px] text-slate-500 leading-relaxed">
              <div className="font-semibold mb-1">
                SBU Layanan Publik, Sumber Daya Alam,<br />dan Investasi
              </div>
              <div className="font-medium">
                PT SUCOFINDO (PERSERO) © 2026
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out min-h-screen ${
          sidebarOpen && !isMobile ? 'md:ml-[240px]' : 'md:ml-[68px]'
        }`}
      >
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Mobile Logo */}
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="#13B2AA" fillOpacity="0.1" stroke="#13B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#13B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="#13B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="#13B2AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-sm font-extrabold tracking-tight">
                <span className="text-blue-600">Tender</span>
                <span style={{ color: '#13B2AA' }}>Hub</span>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex items-center gap-2">
              <button 
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {(newTenderCount + newRupCount) > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              <button 
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label="User profile"
              >
                <User size={18} />
              </button>
            </div>
          </div>
        </header>
        
        {/* Desktop Header */}
        <Header />
        
        {/* Page Content */}
        <div 
          id="main-content"
          className="p-4 sm:p-6 max-w-[1600px] mx-auto min-w-0"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </div>
      </main>



      {/* Global Side Panels */}
      <SidePanel open={!!selectedTender} onClose={() => setSelectedTenderId(null)} title="Detail Tender">
        {selectedTender && <TenderDetail tender={selectedTender} />}
      </SidePanel>
      
      <SidePanel open={!!selectedRup} onClose={() => setSelectedRupId(null)} title="Detail RUP">
        {selectedRup && <RupDetail rup={selectedRup} />}
      </SidePanel>
      
      {/* Expert Detail Modal - Centered */}
      {selectedExpert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm" style={{ background: '#3b82f6' }}>
                  {selectedExpert.nama?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedExpert.nama}</h2>
                  <p className="text-sm text-slate-500">{selectedExpert.instansi}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
                    try {
                      console.log('[Generate CV] Fetching CV for expert:', selectedExpert.id);
                      const response = await fetch(`${apiBase}/cv/${selectedExpert.id}/cv`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
                      });
                      console.log('[Generate CV] Response status:', response.status);
                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error('[Generate CV] Error response:', errorText);
                        throw new Error(`HTTP ${response.status}: ${errorText}`);
                      }
                      const blob = await response.blob();
                      console.log('[Generate CV] Blob size:', blob.size);
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `CV_${selectedExpert.nama.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                      console.log('[Generate CV] Download triggered successfully');
                    } catch (err) {
                      console.error('[Generate CV] Failed:', err);
                      alert(`Gagal generate CV: ${err.message}`);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate CV
                </button>
                <button
                  onClick={() => setSelectedExpertId(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <ExpertDetail expert={selectedExpert} onClose={() => setSelectedExpertId(null)} />
            </div>
          </div>
        </div>
      )}

      <SidePanel open={showPotensiChart} onClose={() => setShowPotensiChart(false)} title="Distribusi Nilai Kontrak Tender">
        <PotensiChartPanel tenders={chartTenders} openTender={(id) => {
          setSelectedTenderId(id);
          setShowPotensiChart(false);
        }} />
      </SidePanel>

      <SidePanel open={showUrgentPanel} onClose={() => setShowUrgentPanel(false)} title="Tender Deadline Mendesak">
        <UrgentPanel tenders={tenders || []} openTender={(id) => {
          setSelectedTenderId(id);
          setShowUrgentPanel(false);
        }} />
      </SidePanel>

      <SidePanel open={showWinrateDetail} onClose={() => setShowWinrateDetail(false)} title="Detail Winrate Tender">
        <WinrateDetail tenders={tenders || []} openTender={(id) => {
          setSelectedTenderId(id);
          setShowWinrateDetail(false);
        }} />
      </SidePanel>

      <SidePanel open={showKeywordManager} onClose={() => setShowKeywordManager(false)} title="Kelola Keyword">
        <KeywordManagerPanel />
      </SidePanel>
      
      {/* Global Search Modal */}
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />

    </div>
  );
}

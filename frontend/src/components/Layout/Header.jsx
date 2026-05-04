import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  User, 
  ChevronRight, 
  Search,
  Settings,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import useKeyboardShortcut from '../../hooks/useKeyboardShortcut';
import GlobalSearch from '../UI/GlobalSearch';

/**
 * Header Component - Top navigation bar with breadcrumbs, search, and user menu
 */
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const { newTenderCount, newRupCount, userProfile } = useAppContext();
  
  // Calculate user initials
  const userInitials = (userProfile?.name || 'Admin LSI')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Keyboard shortcut: Cmd+K or Ctrl+K for search
  useKeyboardShortcut('k', () => setShowGlobalSearch(true), { meta: true, ctrl: true });
  
  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const pathMap = {
      '/': 'Dashboard',
      '/tender': 'Tender Intelligence',
      '/rup': 'RUP Pipeline',
      '/status': 'Status Tender',
      '/experts': 'Tenaga Ahli',
      '/settings': 'Pengaturan',
    };
    
    const path = location.pathname;
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    if (path !== '/') {
      const label = pathMap[path] || path.split('/').pop();
      breadcrumbs.push({ label, path });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  const totalNotifications = newTenderCount + newRupCount;
  
  // Mock notifications
  const notifications = [
    ...(newTenderCount > 0 ? [{
      id: 1,
      type: 'tender',
      title: 'Tender Baru',
      message: `${newTenderCount} tender baru sesuai keyword Anda`,
      time: '5 menit lalu',
      unread: true,
    }] : []),
    ...(newRupCount > 0 ? [{
      id: 2,
      type: 'rup',
      title: 'RUP Baru',
      message: `${newRupCount} paket RUP baru tersedia`,
      time: '10 menit lalu',
      unread: true,
    }] : []),
  ];
  
  return (
    <header className="hidden md:block sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && (
                <ChevronRight size={14} className="text-slate-400" />
              )}
              <button
                onClick={() => navigate(crumb.path)}
                className={`font-semibold transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search Shortcut */}
          <button
            className="hidden lg:flex items-center justify-center w-8 h-8 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setShowGlobalSearch(true)}
            aria-label="Open search (Cmd+K)"
          >
            <Search size={16} />
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell size={20} />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-extrabold text-white bg-red-500 rounded-full ring-2 ring-white">
                  {totalNotifications > 99 ? '99+' : totalNotifications}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-20 animate-slideDown">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">Notifikasi</h3>
                      {totalNotifications > 0 && (
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                          Tandai Semua Dibaca
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className="w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => {
                            setShowNotifications(false);
                            if (notif.type === 'tender') navigate('/tender');
                            if (notif.type === 'rup') navigate('/rup');
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {notif.unread && (
                              <div className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 mb-0.5">
                                {notif.title}
                              </p>
                              <p className="text-xs text-slate-600 mb-1">
                                {notif.message}
                              </p>
                              <p className="text-xs text-slate-500">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-600">Tidak ada notifikasi baru</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-200">
                      <button className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700 text-center">
                        Lihat Semua Notifikasi
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-md">
                {userInitials}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900">{userProfile?.name || 'Admin LSI'}</div>
                <div className="text-[10px] text-slate-500">{userProfile?.title || 'Sales & Marketing'}</div>
              </div>
            </button>
            
            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-20 animate-slideDown">
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{userProfile?.name || 'Admin LSI'}</div>
                        <div className="text-xs text-slate-500 truncate">admin@sucofindo.co.id</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User size={16} />
                      <span>Profil Saya</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Pengaturan</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Implement help
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <HelpCircle size={16} />
                      <span>Bantuan</span>
                    </button>
                  </div>
                  
                  <div className="p-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Implement logout
                        console.log('Logout');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Global Search Modal */}
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />
    </header>
  );
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slideDown {
    animation: slideDown 200ms ease-out;
  }
`;
if (!document.querySelector('style[data-header-styles]')) {
  style.setAttribute('data-header-styles', 'true');
  document.head.appendChild(style);
}

export default Header;

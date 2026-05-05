import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Search, MapPin, Tag, Menu, PanelLeftClose, PanelLeft, Home, Layers, Users, Settings, Activity, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';

export const Sidebar = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppContext();

  const navs = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "Tender Intelligence", icon: Layers, path: "/tender", badge: 3 },
    { label: "Pipeline RUP", icon: MapPin, path: "/rup" },
    { label: "Database Tenaga Ahli", icon: Users, path: "/experts" },
    { label: "Settings", icon: Settings, path: "/settings" }
  ];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header with Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img 
            src="/assets/sucofindo-logo.png" 
            alt="Sucofindo Logo" 
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          />
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
        
        <div>
          <div className="brand-title">Tender<span style={{ color: 'var(--primary)' }}>Hub</span></div>
          <div className="brand-kicker" style={{ marginTop: '2px', fontSize: '9px', fontWeight: 800 }}>SBU Layanan Publik, Sumber Daya Alam, dan Investasi</div>
          <div className="brand-kicker" style={{ marginTop: '1px', fontSize: '9px', fontWeight: 500, color: 'var(--muted)' }}>PT SUCOFINDO</div>
        </div>
      </div>

      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px', paddingLeft: '12px' }} className="nav-label">
        Main Navigation
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {navs.map((n, i) => (
          <NavLink 
            key={i} 
            to={n.path} 
            className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
          >
            <n.icon size={18} />
            <span className="nav-label">{n.label}</span>
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </NavLink>
        ))}
      </nav>
      
      {/* Copyright Footer */}
      <div style={{ 
        padding: '16px 12px', 
        borderTop: '1px solid #e2e8f0',
        fontSize: '9px',
        color: '#64748b',
        lineHeight: '1.4'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          SBU Layanan Publik, Sumber Daya Alam, dan Investasi
        </div>
        <div style={{ fontWeight: 500 }}>
          PT SUCOFINDO (PERSERO) © 2026
        </div>
      </div>
    </aside>
  );
};

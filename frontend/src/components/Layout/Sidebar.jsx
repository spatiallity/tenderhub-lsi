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
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '0 8px' }}>
        <div>
          <div className="brand-title">Tender<span style={{ color: 'var(--primary)' }}>Hub</span></div>
          <div className="brand-kicker" style={{ marginTop: '2px', fontSize: '10px' }}>SBU LSI PT SUCOFINDO</div>
        </div>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '12px', paddingLeft: '12px' }} className="nav-label">
        Main Navigation
      </div>

      <nav>
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

      <div className="sidebar-bottom" style={{ marginTop: 'auto', padding: '16px 12px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '13px', background: 'var(--primary)' }}>AR</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800 }}>Arvian Riatmaja</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Sales LSI</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

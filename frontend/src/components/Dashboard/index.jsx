import React from 'react';
import { Card } from '../UI';
import { TrendingUp, Activity } from 'lucide-react';

export const KpiCard = ({ title, value, subtitle, trend }) => (
  <Card>
    <div className="section-title" style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>{title}</div>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
      <div className="kpi-value">{value}</div>
      {trend && (
        <div style={{ fontSize: '12px', fontWeight: 700, color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px' }}>
          <TrendingUp size={12} /> {trend}
        </div>
      )}
    </div>
    {subtitle && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>{subtitle}</div>}
  </Card>
);

export const ActivityFeed = ({ activities = [] }) => (
  <div className="activity-strip">
    {activities.map((act, i) => (
      <div key={i} className="activity-chip">
        <div className="icon-tile" style={{ width: '32px', height: '32px', background: '#eef2ff', color: 'var(--primary)' }}>
          <Activity size={14} />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3, marginBottom: '2px' }}>{act.text}</div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{act.time}</div>
        </div>
      </div>
    ))}
    {activities.length === 0 && <div className="muted" style={{ padding: '12px' }}>Belum ada aktivitas.</div>}
  </div>
);

export const WinrateChart = ({ series = [] }) => {
  const max = Math.max(...series.map(d => d.ikut), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '16px', padding: '10px 0' }}>
      {series.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px', position: 'relative' }}>
            {/* Ikut Bar */}
            <div style={{ flex: 1, background: '#cbd5e1', borderRadius: '4px 4px 0 0', height: `${(d.ikut/max)*100}%`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: 'var(--muted)' }}>{d.ikut}</span>
            </div>
            {/* Menang Bar */}
            <div style={{ flex: 1, background: 'var(--success)', borderRadius: '4px 4px 0 0', height: `${(d.menang/max)*100}%`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-18px', width: '100%', textAlign: 'center', fontSize: '10px', fontWeight: 800, color: 'var(--success)' }}>{d.menang}</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
};

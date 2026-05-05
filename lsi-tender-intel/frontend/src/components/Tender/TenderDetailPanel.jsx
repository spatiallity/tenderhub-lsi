import React, { useState, useEffect } from 'react';
import { SidePanel, Badge, Button, RelevanceBar, CountdownBadge } from '../UI';
import TenderTimeline from './TenderTimeline';
import { formatRupiah, portfolioColor, internalStatusColor } from '../../utils/format';
import { ExternalLink, Users, Save, Lock } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TenderDetailPanel = ({ tender, onClose }) => {
  const { showToast, updateTenderStatus } = useAppContext();
  const { canEditInternalStatus } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('Dipantau');

  useEffect(() => {
    if (tender) {
      setSelectedStatus(tender.internalStatus || tender.status_internal || 'Dipantau');
    }
  }, [tender]);
  
  if (!tender) return null;

  const handleSaveWatchlist = () => {
    updateTenderStatus(tender.kd_tender || tender.id, selectedStatus);
    onClose();
  };

  return (
    <SidePanel title="Detail Tender" isOpen={!!tender} onClose={onClose}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1.3, marginBottom: '8px' }}>{tender.nama || tender.nama_paket}</div>
        <div className="muted">{tender.instansi || tender.nama_klpd}</div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="status-card">
          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>HPS / Pagu</div>
          <div style={{ fontSize: '16px', fontWeight: 800 }}>{formatRupiah(tender.hps || tender.pagu || 0)}</div>
        </div>
        <div className="status-card">
          <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Relevance Score</div>
          <RelevanceBar score={tender.relevance_score || 0} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <Badge color={portfolioColor[tender.portofolio || tender.recommended_subporto] || 'gray'}>
          {tender.portofolio || tender.recommended_subporto}
        </Badge>
        <Badge color={internalStatusColor[tender.internalStatus || tender.status_internal] || 'gray'}>
          {tender.internalStatus || tender.status_internal || 'Dipantau'}
        </Badge>
        <CountdownBadge dateStr={tender.deadlineStage} days={tender.daysLeft} expired={tender.deadlinePassed} />
      </div>

      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div>
          <label className="muted" style={{ fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            Ubah Status Internal
            {!canEditInternalStatus && <Lock size={11} style={{ color: '#94a3b8' }} />}
          </label>
          {canEditInternalStatus ? (
            <select style={{ width: '100%', marginTop: '4px' }} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option>Dipantau</option>
              <option>Akan Diikuti</option>
              <option>Sudah Diikuti</option>
              <option>Tidak Relevan</option>
            </select>
          ) : (
            <div style={{ marginTop: '4px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#64748b', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} />
              {selectedStatus} <span style={{ fontSize: '11px', color: '#94a3b8' }}>(hanya Manager/Admin)</span>
            </div>
          )}
        </div>
        <div>
          <label className="muted" style={{ fontSize: '12px', fontWeight: 800 }}>Assign Tenaga Ahli</label>
          <button className="btn ghost" style={{ width: '100%', marginTop: '4px', justifyContent: 'space-between' }}>
            <span>Pilih Tenaga Ahli</span>
            <Users size={14} />
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <Button className="primary" style={{ flex: 1 }} onClick={handleSaveWatchlist} disabled={!canEditInternalStatus}>
          <Save size={16} /> {canEditInternalStatus ? 'Simpan Perubahan' : 'Tidak Ada Akses Edit'}
        </Button>
        {tender.lpse && (
          <a href={tender.lpse} target="_blank" rel="noreferrer" className="btn ghost">
            <ExternalLink size={16} /> LPSE
          </a>
        )}
      </div>

      <div className="section-title" style={{ marginBottom: '16px' }}>Tahapan Tender</div>
      <TenderTimeline 
        metode={tender.metode || 'Prakualifikasi'} 
        currentStage={tender.currentStage || 1} 
        changes={tender.changes || {}} 
      />
    </SidePanel>
  );
};

export default TenderDetailPanel;

import React from 'react';
import { SidePanel, Badge, Button, RelevanceBar, CountdownBadge } from '../UI';
import TenderTimeline from './TenderTimeline';
import { formatRupiah, portfolioColor, internalStatusColor } from '../../utils/format';
import { ExternalLink, Users, Save } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import api from '../../services/api';

const TenderDetailPanel = ({ tender, onClose }) => {
  const { showToast } = useAppContext();
  
  if (!tender) return null;

  const handleSaveWatchlist = () => {
    // API call to watchlist logic
    api.post('/watchlist', { kd_tender: tender.kd_tender || tender.id, nama_paket: tender.nama, hps: tender.hps })
      .then(() => showToast("Tender ditambahkan ke Watchlist!"))
      .catch(() => showToast("Gagal menyimpan tender", "error"));
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
          <label className="muted" style={{ fontSize: '12px', fontWeight: 800 }}>Ubah Status Internal</label>
          <select style={{ width: '100%', marginTop: '4px' }} defaultValue={tender.internalStatus || tender.status_internal || 'Dipantau'}>
            <option>Dipantau</option>
            <option>Akan Diikuti</option>
            <option>Sudah Diikuti</option>
            <option>Tidak Relevan</option>
          </select>
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
        <Button className="primary" style={{ flex: 1 }} onClick={handleSaveWatchlist}>
          <Save size={16} /> Simpan Perubahan
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

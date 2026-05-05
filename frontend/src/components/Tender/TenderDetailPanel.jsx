import React, { useState } from 'react';
import { SidePanel, Badge, Button, RelevanceBar, CountdownBadge } from '../UI';
import TenderTimeline from './TenderTimeline';
import { formatRupiah, portfolioColor, internalStatusColor } from '../../utils/format';
import { ExternalLink, Users, Save, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import api from '../../services/api';

const TenderDetailPanel = ({ tender, onClose }) => {
  const { showToast } = useAppContext();
  const [status, setStatus] = useState(tender?.internalStatus || tender?.status_internal || 'Dipantau');
  const [notes, setNotes] = useState(tender?.catatan_internal || '');
  const [saving, setSaving] = useState(false);
  const [watchlistId, setWatchlistId] = useState(tender?.watchlist_id || null);

  if (!tender) return null;

  const handleSaveChanges = async () => {
    if (!watchlistId) {
      // Add to watchlist first
      setSaving(true);
      try {
        const res = await api.post('/watchlist', {
          kd_tender: tender.kd_tender || tender.id,
          nama_paket: tender.nama || tender.nama_paket,
          hps: tender.hps || tender.pagu,
          status_internal: status,
          catatan_internal: notes,
        });
        setWatchlistId(res.data.id);
        showToast("Tender ditambahkan ke Watchlist!");
      } catch (err) {
        showToast("Gagal menyimpan tender", "error");
      } finally {
        setSaving(false);
      }
    } else {
      // Update existing watchlist item
      setSaving(true);
      try {
        await api.put(`/watchlist/${watchlistId}`, {
          status_internal: status,
          catatan_internal: notes,
        });
        showToast("Perubahan disimpan!");
      } catch (err) {
        showToast("Gagal menyimpan perubahan", "error");
      } finally {
        setSaving(false);
      }
    }
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
        <Badge color={internalStatusColor[status] || 'gray'}>
          {status}
        </Badge>
        <CountdownBadge dateStr={tender.deadlineStage} days={tender.daysLeft} expired={tender.deadlinePassed} />
      </div>

      {!watchlistId && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', marginBottom: '24px' }}>
          <AlertCircle size={16} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '12px', color: '#92400e' }}>Tender belum di watchlist. Simpan untuk menambahkannya.</p>
        </div>
      )}

      <div className="form-grid" style={{ marginBottom: '24px' }}>
        <div>
          <label className="muted" style={{ fontSize: '12px', fontWeight: 800 }}>Status Internal</label>
          <select
            style={{ width: '100%', marginTop: '4px' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
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

      <div>
        <label className="muted" style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px', display: 'block' }}>Catatan Internal</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan catatan untuk tender ini..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'inherit',
            marginBottom: '24px',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <Button
          className="primary"
          style={{ flex: 1, opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
          onClick={handleSaveChanges}
          disabled={saving}
        >
          {saving ? (
            <>
              <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', marginRight: '8px', animation: 'spin 0.6s linear infinite' }} />
              Menyimpan...
            </>
          ) : (
            <>
              <Save size={16} /> Simpan Perubahan
            </>
          )}
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

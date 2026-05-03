import React from 'react';
import { getStages, formatDate } from '../../utils/format';
import { CheckCircle, Circle } from 'lucide-react';

const TenderTimeline = ({ metode, currentStage, changes = {} }) => {
  const stages = getStages(metode);
  
  return (
    <div style={{ marginTop: '24px' }}>
      {stages.map((stage, idx) => {
        const isPast = idx < currentStage;
        const isCurrent = idx === currentStage;
        const isFuture = idx > currentStage;
        const hasChange = changes[idx];
        
        let color = isPast ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--muted)';
        
        return (
          <div key={idx} className="timeline-row">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="timeline-node" style={{ borderColor: color, background: isPast ? color : '#fff', color: isPast ? '#fff' : color }}>
                {isPast ? <CheckCircle size={14} /> : isCurrent ? <Circle size={10} fill="currentColor" /> : null}
              </div>
              {idx < stages.length - 1 && <div className="timeline-line" style={{ background: isPast ? 'var(--success)' : '#e2e8f0' }}></div>}
            </div>
            <div style={{ paddingBottom: '24px', paddingTop: '2px' }}>
              <div style={{ fontWeight: isCurrent ? 800 : 600, color: isFuture ? 'var(--muted)' : 'var(--text)', fontSize: '13px' }}>
                {stage[0]}
                {hasChange && (
                  <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                    Berubah {hasChange}x
                  </span>
                )}
              </div>
              {isCurrent && (
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
                  Tahap Saat Ini
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TenderTimeline;

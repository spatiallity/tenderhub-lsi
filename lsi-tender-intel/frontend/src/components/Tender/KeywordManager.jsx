import React from 'react';
import { Target } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';

const KeywordManager = ({ currentPortfolio, onPortfolioChange }) => {
  const { keywords, toggleKeyword } = useAppContext();
  const subportos = ["SDA", "FLP", "FITI"];
  
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
        <div className="icon-tile" style={{ background: '#eef2ff', color: '#4f46e5' }}>
          <Target size={20} />
        </div>
        <div>
          <div className="section-title">Relevance Engine</div>
          <div className="muted" style={{ fontSize: '12px' }}>Filter tender berdasarkan kecocokan keyword</div>
        </div>
      </div>
      
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
          <button className={`pill-tab ${currentPortfolio === "Semua" ? "active" : ""}`} onClick={() => onPortfolioChange("Semua")}>Semua Portofolio</button>
          {subportos.map(sp => (
            <button key={sp} className={`pill-tab ${currentPortfolio === sp ? "active" : ""}`} onClick={() => onPortfolioChange(sp)}>{sp}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {subportos.map(sp => (
            <React.Fragment key={sp}>
              {(currentPortfolio === "Semua" || currentPortfolio === sp) && keywords[sp].map((k) => (
                <button
                  key={k.id}
                  onClick={() => toggleKeyword(sp, k.id)}
                  style={{
                    border: k.active ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: k.active ? 'var(--primary-soft)' : '#f8fafc',
                    color: k.active ? 'var(--primary)' : 'var(--muted)',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    transition: '.15s',
                  }}
                >
                  {k.text} {k.active && "✓"}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeywordManager;

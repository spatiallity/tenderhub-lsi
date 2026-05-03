import React, { useMemo, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useAppContext } from '../../store/AppContext';
import { Badge, Btn, Card } from '../UI/index';
import { portfolioColor } from '../../utils/constants';
import { activeKeywordCount } from '../../utils/helpers';

export default function KeywordManagerPanel() {
  const { keywords, addKeyword, removeKeyword, clearKeywords } = useAppContext();
  const [draft, setDraft] = useState({ text: '', portfolio: 'SDA' });

  const keywordCount = useMemo(() => activeKeywordCount(keywords), [keywords]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-slate-50 border border-slate-200">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Kelola Keyword</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {keywordCount
                ? `${keywordCount} keyword aktif. Tender/RUP akan terfilter otomatis sesuai keyword aktif.`
              : 'Tidak ada keyword aktif. Semua tender/RUP ditampilkan.'}
            </p>
          </div>
          <Btn className="ghost small" onClick={clearKeywords} disabled={keywordCount === 0}>
            <Trash2 size={14} />
            Clear Keyword
          </Btn>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px_auto] gap-2 mt-3">
          <input
            placeholder="Tambah keyword baru..."
            value={draft.text}
            onChange={e => setDraft(prev => ({ ...prev, text: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <select
            value={draft.portfolio}
            onChange={e => setDraft(prev => ({ ...prev, portfolio: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none"
          >
            <option>SDA</option>
            <option>FLP</option>
            <option>FITI</option>
          </select>
          <Btn
            className="primary"
            onClick={() => {
              if (!draft.text.trim()) return;
              addKeyword(draft.portfolio, draft.text);
              setDraft({ text: '', portfolio: draft.portfolio });
            }}
          >
            <Plus size={16} />
            Tambah
          </Btn>
        </div>
      </Card>

      {Object.entries(keywords).map(([portfolio, items]) => (
        <Card key={portfolio} className="!p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge color={portfolioColor[portfolio]}>{portfolio}</Badge>
              <span className="text-slate-500 text-xs font-extrabold">{items.filter(k => k.active).length} aktif</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {items.filter(k => k.active).map(k => (
              <span
                key={k.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                  portfolio === 'SDA'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : portfolio === 'FLP'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {k.text}
                <button
                  onClick={() => removeKeyword(portfolio, k.id)}
                  className="border-0 bg-transparent p-0 text-inherit inline-flex cursor-pointer hover:text-slate-900 transition-colors"
                  title="Hapus keyword"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {items.filter(k => k.active).length === 0 && (
              <div className="text-xs text-slate-500">Belum ada keyword aktif di portofolio ini.</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

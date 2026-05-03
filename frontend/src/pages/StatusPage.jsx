import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { Badge, CountdownBadge, PageTitle, Card } from '../components/UI/index';
import { formatRupiah } from '../utils/helpers';

// Extracted outside render to avoid re-creation every render
const KanbanCard = React.memo(({ tender, onSelect }) => (
  <Card
    className="w-full cursor-pointer hover:shadow-md transition-shadow mb-2 !p-3 h-[185px] min-h-[185px] max-h-[185px] shrink-0 flex flex-col"
    onClick={() => onSelect(tender.id)}
  >
    <h3 className="text-xs font-bold tracking-tight line-clamp-2 mb-1.5 min-h-[32px] break-words whitespace-normal">{tender.nama}</h3>
    <div className="text-slate-500 text-[10px] line-clamp-1 mb-2 break-words whitespace-normal">{tender.instansi}</div>
    <div className="mb-2">
      <div className="text-[9px] text-slate-600 flex flex-wrap items-center">
        <span className="font-semibold whitespace-nowrap">Tahap {tender.currentStage}/{tender.totalStages}</span>
        <span className="text-slate-400 mx-1">•</span>
        <span className="text-slate-500 line-clamp-1 flex-1 min-w-0">{tender.currentStageName}</span>
      </div>
    </div>
    <div className="mb-auto">
      <CountdownBadge dateStr={tender.deadlineStage} days={tender.daysLeft} expired={tender.deadlinePassed} />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">HPS</span>
      <span className="font-bold text-xs text-slate-800">{formatRupiah(tender.hps)}</span>
    </div>
  </Card>
));

const COLOR_MAP = {
  amber: { border: 'border-amber-200', bg: 'bg-amber-50' },
  blue: { border: 'border-blue-200', bg: 'bg-blue-50' },
  green: { border: 'border-green-200', bg: 'bg-green-50' },
  red: { border: 'border-red-200', bg: 'bg-red-50' },
  gray: { border: 'border-slate-200', bg: 'bg-slate-50' },
};

const KanbanColumn = React.memo(({ title, color, tenders, onSelect }) => {
  const [limit, setLimit] = React.useState(20);
  const displayTenders = tenders.slice(0, limit);
  const hasMore = tenders.length > limit;
  const theme = COLOR_MAP[color] || COLOR_MAP.gray;

  return (
    <div className="flex-none w-[280px] h-full flex flex-col">
      <div className="flex-none pb-2">
        <div className={`rounded-lg border-2 ${theme.border} ${theme.bg} p-2.5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold tracking-tight">{title}</h2>
            <Badge color={color} size="sm">{tenders.length}</Badge>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {displayTenders.length > 0 ? (
          <>
            {displayTenders.map(t => <KanbanCard key={t.id} tender={t} onSelect={onSelect} />)}
            {hasMore && (
              <div 
                className="text-center p-2 text-blue-600 hover:text-blue-800 text-[11px] font-bold cursor-pointer hover:underline"
                onClick={() => setLimit(tenders.length)}
              >
                +{tenders.length - limit} tender lainnya
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-slate-400 text-[10px] border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            Tidak ada tender
          </div>
        )}
      </div>
    </div>
  );
});

export default function StatusPage() {
  const [showIrrelevant, setShowIrrelevant] = React.useState(false);
  const { tenders, setSelectedTenderId } = useAppContext();

  const statusBuckets = useMemo(() => ({
    'Akan Diikuti': tenders.filter(t => t.internalStatus === 'Akan Diikuti'),
    'Sudah Diikuti': tenders.filter(t => t.internalStatus === 'Sudah Diikuti'),
    'Menang': tenders.filter(t => t.internalStatus === 'Menang'),
    'Kalah': tenders.filter(t => t.internalStatus === 'Kalah'),
    'Tidak Relevan': tenders.filter(t => t.internalStatus === 'Tidak Relevan'),
  }), [tenders]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PageTitle
          title="Status Tender - Kanban Board"
          subtitle="Monitoring tender yang diprioritaskan: Akan Diikuti, Sudah Diikuti, Menang, dan Kalah."
          right={
            <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white shadow-sm">
              <input
                id="kanbanShowIrrelevant"
                type="checkbox"
                checked={showIrrelevant}
                onChange={e => setShowIrrelevant(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="kanbanShowIrrelevant" className="text-xs font-extrabold text-slate-700 cursor-pointer">
                Tampilkan "Tidak Relevan"
              </label>
            </div>
          }
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 mt-4">
        <div className="flex gap-4 h-full pb-4 w-max min-w-full">
          <KanbanColumn 
            title="Akan Diikuti" 
            color="amber" 
            tenders={statusBuckets['Akan Diikuti']} 
            onSelect={setSelectedTenderId}
          />
          <KanbanColumn 
            title="Sudah Diikuti" 
            color="blue" 
            tenders={statusBuckets['Sudah Diikuti']} 
            onSelect={setSelectedTenderId}
          />
          <KanbanColumn 
            title="Menang" 
            color="green" 
            tenders={statusBuckets['Menang']} 
            onSelect={setSelectedTenderId}
          />
          <KanbanColumn 
            title="Kalah" 
            color="red" 
            tenders={statusBuckets['Kalah']} 
            onSelect={setSelectedTenderId}
          />
          {showIrrelevant && (
            <KanbanColumn 
              title="Tidak Relevan" 
              color="gray" 
              tenders={statusBuckets['Tidak Relevan']} 
              onSelect={setSelectedTenderId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

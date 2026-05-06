import { useEffect, useRef } from 'react';
import supabase from '../services/supabase';
import { useAppContext } from '../store/AppContext';

export const useWatchlistRealtime = () => {
  const { setInternalStatuses, setAssignedPICs, setTenderNotes } = useAppContext();
  const lastLocalUpdateRef = useRef({});

  // Track local updates to prevent echo
  useEffect(() => {
    const handleBeforeUpdate = (e) => {
      if (e.detail?.tenderId) {
        lastLocalUpdateRef.current[e.detail.tenderId] = Date.now();
      }
    };

    window.addEventListener('tender-local-update', handleBeforeUpdate);
    return () => window.removeEventListener('tender-local-update', handleBeforeUpdate);
  }, []);

  useEffect(() => {
    // Subscribe to ALL watchlist changes — shared team watchlist
    const subscription = supabase
      .channel('tender_watchlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tender_watchlist',
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          const recordId = newRecord?.kd_tender || oldRecord?.kd_tender;

          // Skip echo from own optimistic updates (within 3 seconds)
          const lastLocalUpdate = lastLocalUpdateRef.current[recordId];
          if (lastLocalUpdate && Date.now() - lastLocalUpdate < 3000) {
            return;
          }

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const tenderId = newRecord.kd_tender;

            if (newRecord.status_internal) {
              setInternalStatuses(prev => ({ ...prev, [tenderId]: newRecord.status_internal }));
            }

            if (newRecord.assigned_pic !== undefined) {
              setAssignedPICs(prev => ({ ...prev, [tenderId]: newRecord.assigned_pic }));
            }

            if (newRecord.catatan_internal) {
              try {
                const notes = JSON.parse(newRecord.catatan_internal);
                setTenderNotes(prev => ({ ...prev, [tenderId]: notes }));
              } catch {}
            }
          } else if (eventType === 'DELETE') {
            const tenderId = oldRecord.kd_tender;
            setInternalStatuses(prev => ({ ...prev, [tenderId]: 'Dipantau' }));
            setAssignedPICs(prev => { const next = { ...prev }; delete next[tenderId]; return next; });
            setTenderNotes(prev => { const next = { ...prev }; delete next[tenderId]; return next; });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setInternalStatuses, setAssignedPICs, setTenderNotes]);
};

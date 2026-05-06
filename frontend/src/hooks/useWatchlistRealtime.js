import { useEffect, useRef } from 'react';
import supabase from '../services/supabase';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';

export const useWatchlistRealtime = () => {
  const { setInternalStatuses, setAssignedPICs, setTenderNotes } = useAppContext();
  const { user, isGuest } = useAuth();
  const lastLocalUpdateRef = useRef({});

  // Track local updates to prevent echo
  useEffect(() => {
    const handleBeforeUpdate = (e) => {
      if (e.detail?.tenderId) {
        lastLocalUpdateRef.current[e.detail.tenderId] = Date.now();
        console.log(`[Realtime] Marked tender ${e.detail.tenderId} as locally updated at`, Date.now());
      }
    };

    window.addEventListener('tender-local-update', handleBeforeUpdate);
    return () => window.removeEventListener('tender-local-update', handleBeforeUpdate);
  }, []);

  useEffect(() => {
    // Guests have no watchlist — no subscription needed
    if (!user || isGuest) {
      console.log('[Realtime] Skipping subscription - guest or no user');
      return;
    }

    // DEVELOPMENT MODE: Disable realtime subscription to prevent conflicts
    // In development, single user doesn't need realtime sync
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      console.log('[Realtime] Development mode - realtime subscription DISABLED');
      console.log('[Realtime] Data will sync on page refresh (F5)');
      console.log('[Realtime] In production, realtime will be enabled for multi-user sync');
      return;
    }

    // PRODUCTION MODE: Enable realtime for multi-user collaboration
    console.log(`[Realtime] Production mode - Setting up realtime subscription for user ${user.id}`);

    const subscription = supabase
      .channel(`tender_watchlist_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tender_watchlist',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          const recordId = newRecord?.kd_tender || oldRecord?.kd_tender;
          console.log(`[Realtime] Received ${eventType} event for tender ${recordId}`, payload);

          // Skip echo from own optimistic updates (within 10 seconds)
          const lastLocalUpdate = lastLocalUpdateRef.current[recordId];
          if (lastLocalUpdate && Date.now() - lastLocalUpdate < 10000) {
            console.log(`[Realtime] Skipping echo - local update was ${Date.now() - lastLocalUpdate}ms ago`);
            return;
          }

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            const tenderId = newRecord.kd_tender;
            console.log(`[Realtime] Applying remote update for tender ${tenderId}`);

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
            console.log(`[Realtime] Applying remote delete for tender ${tenderId}`);
            setInternalStatuses(prev => ({ ...prev, [tenderId]: 'Dipantau' }));
            setAssignedPICs(prev => { const next = { ...prev }; delete next[tenderId]; return next; });
            setTenderNotes(prev => { const next = { ...prev }; delete next[tenderId]; return next; });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('[Realtime] Unsubscribing from watchlist changes');
      subscription.unsubscribe();
    };
  }, [user, isGuest, setInternalStatuses, setAssignedPICs, setTenderNotes]);
};

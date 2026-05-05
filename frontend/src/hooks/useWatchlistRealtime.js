import { useEffect } from 'react';
import supabase from '../services/supabase';
import { useAppContext } from '../store/AppContext';

export const useWatchlistRealtime = () => {
  const { refetchTenders } = useAppContext();

  useEffect(() => {
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
          // Re-fetch tenders to get updated watchlist data
          refetchTenders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetchTenders]);
};

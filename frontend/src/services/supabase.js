import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pu8lvRwtj6NJbOPUN7-hLA.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pu8lvRwtj6NJbOPUN7-hLA_6GBX7NgT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

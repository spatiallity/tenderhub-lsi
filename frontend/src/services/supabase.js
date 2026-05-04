import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aedojcjkhorogsgwasab.supabase.co';
// WARNING: You must update this anon key to match the new project URL!
const SUPABASE_ANON_KEY = 'sb_publishable_pu8lvRwtj6NJbOPUN7-hLA_6GBX7NgT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

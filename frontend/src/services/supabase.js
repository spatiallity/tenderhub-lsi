import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aedojcjkhorogsgwasab.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlZG9qY2praG9yb2dzZ3dhc2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDY0OTcsImV4cCI6MjA5MzM4MjQ5N30.lxvlXjgNBz8ChbparIl0hyXo37e6ezkhCNbDBaQa7iI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

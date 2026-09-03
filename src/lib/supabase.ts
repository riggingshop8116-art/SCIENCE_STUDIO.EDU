import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const env = meta?.env || {};

const SUPABASE_URL = 
  env.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : undefined) || 
  'https://tcsblgpiufflkitislpz.supabase.co';

const SUPABASE_ANON_KEY = 
  env.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY : undefined) || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc2JsZ3BpdWZmbGtpdGlzbHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNTYzNjAsImV4cCI6MjEwMzYzMjM2MH0.E8BphiNRyLHSC58SXPmU6CaWDMScn9HllLZw2V8DPO8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const canAttemptSupabase = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

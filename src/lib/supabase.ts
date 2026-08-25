import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const env = meta?.env || {};

const SUPABASE_URL = 
  env.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL : undefined) || 
  'https://skjrkcasvvhwipskypqb.supabase.co';

const SUPABASE_ANON_KEY = 
  env.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY : undefined) || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNranJrY2FzdnZod2lwc2t5cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyODcxNzcsImV4cCI6MjEwMDg2MzE3N30.CoCaPt-QXq-um4j4HT5hrP73kAu7uMlFRMDDg4Ym4Yc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pybvwtzybgogsxyibocd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnZ3dHp5YmdvZ3N4eWlib2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjUwMjAsImV4cCI6MjA4NTU0MTAyMH0.kz9MHXGJhLEvyBFiNBAGzEir8UKccATBJsa5Qomlj7I';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_PROJECT_URL = SUPABASE_URL;

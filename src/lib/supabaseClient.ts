// src/lib/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Browser client (used in UI) - correctly manages cookies for SSR
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (bypass RLS for privileged ops)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

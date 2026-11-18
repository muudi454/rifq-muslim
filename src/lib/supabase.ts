import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

const looksReal =
  /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(rawUrl.replace(/\/$/, '')) &&
  rawKey.length > 40 &&
  !/your-|placeholder|example/i.test(rawKey);

/** True when real Supabase credentials are present at build time. */
export const isCloudConfigured = looksReal;

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(rawUrl.replace(/\/$/, ''), rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'rifq.auth.session',
      },
    })
  : null;

export const supabaseUrl = rawUrl;

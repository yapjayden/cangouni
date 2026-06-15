// src/lib/supabase.ts
// Browser Supabase client. Kept null-safe: if the env vars aren't set the app
// still runs in guest-only mode (profiles stay in localStorage), so local dev
// and previews don't break before Supabase is configured.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

/** True when Supabase is configured — used to show/hide the login UI. */
export const isSupabaseEnabled = supabase !== null;

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!url || !anonKey) {
  console.warn("Supabase env vars missing — dashboard and community pages will not load data.");
}

const supabaseUrl = url ?? "https://placeholder.supabase.co";
const supabaseAnonKey = anonKey ?? "placeholder-key";

// Uses only the anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

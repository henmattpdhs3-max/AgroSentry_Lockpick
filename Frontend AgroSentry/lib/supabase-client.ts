import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!url || !anonKey) {
  // Fail loudly at build/dev time
  console.warn(
    "Supabase env vars missing — dashboard and community pages will not load data."
  );
}

// Uses only the anon key
export const supabase = createClient(url ?? "", anonKey ?? "");

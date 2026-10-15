import type { Store } from "./types";
import { fileStore } from "./filestore";
import { supabaseStore } from "./supabasestore";

export const usingSupabase = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const store = (): Store => {
  if (usingSupabase()) return supabaseStore;
  // The local-file fallback can't persist on Vercel (read-only, per-request filesystem), so refuse loudly instead of losing data.
  if (process.env.NODE_ENV === "production") throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return fileStore;
};

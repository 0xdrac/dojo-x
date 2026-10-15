import type { Store } from "./types";
import { fileStore } from "./filestore";
import { supabaseStore } from "./supabasestore";

export const usingSupabase = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const store = (): Store => (usingSupabase() ? supabaseStore : fileStore);

import { createClient } from "@supabase/supabase-js";
import { usingSupabase } from "@/lib/server/store";
import { json } from "@/lib/server/util";

/** Setup check: open /api/health to see which storage the app is using and whether the database answers. No secrets are returned. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const out: Record<string, unknown> = {
    storage: usingSupabase() ? "supabase" : "local file (.data/dojo.json)",
    urlSet: !!url, serviceKeySet: !!key, sessionSecretSet: !!process.env.SESSION_SECRET,
  };
  if (url && !/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) out.urlProblem = "NEXT_PUBLIC_SUPABASE_URL should look like https://<project-id>.supabase.co (no /rest/v1, no spaces)";
  if (url && key) {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    for (const t of ["accounts", "members", "trials", "staff"]) {
      const r = await sb.from(t).select("id", { count: "exact", head: true });
      out[`table_${t}`] = r.error ? `ERROR: ${r.error.message}` : `ok (${r.count} rows)`;
    }
  }
  return json(out);
}

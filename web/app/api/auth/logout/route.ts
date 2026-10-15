import { clearSession } from "@/lib/server/session";
import { json } from "@/lib/server/util";

export async function POST() { await clearSession(); return json({ ok: true }); }

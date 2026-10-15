import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";

export async function GET() {
  const sess = await getSession("staff"); if (!sess) return fail("Staff only", 401);
  const st = await store().staffById(sess.sub); if (!st) return fail("Staff only", 401);
  return json({ members: await store().allMembers() });
}

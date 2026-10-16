import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";
import { T } from "@/lib/server/tables";
import { planSummary } from "@/lib/server/billing";

export async function GET() {
  const sess = await getSession("staff"); if (!sess) return fail("Staff only", 401);
  const st = await store().staffById(sess.sub); if (!st) return fail("Staff only", 401);
  const [members, ms] = await Promise.all([store().allMembers(), T.list("memberships")]);
  return json({ members: members.map((m) => ({ ...m, plan: planSummary(ms.filter((x) => x.member_id === m.id)) })) });
}

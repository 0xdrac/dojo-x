import { store } from "@/lib/server/store";
import { isRes, staffGuard } from "@/lib/server/guard";
import { json } from "@/lib/server/util";
import { T } from "@/lib/server/tables";
import { planSummary } from "@/lib/server/billing";

/** GET ?q= → members matching name, phone or member ID (max 20). */
export async function GET(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const q = (new URL(req.url).searchParams.get("q") || "").toLowerCase().replace(/\s/g, "");
  if (!q) return json({ members: [] });
  const all = await store().allMembers();
  const hit = all.filter((m) => m.name.toLowerCase().replace(/\s/g, "").includes(q) || m.phone.includes(q.replace(/\D/g, "") || "~") || m.memberCode.toLowerCase().includes(q));
  const ms = await T.list("memberships");
  return json({ members: hit.slice(0, 20).map((m) => ({ ...m, plan: planSummary(ms.filter((x) => x.member_id === m.id)) })) });
}

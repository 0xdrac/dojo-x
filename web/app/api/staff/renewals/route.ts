import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { isRes, staffGuard, today } from "@/lib/server/guard";
import { planSummary } from "@/lib/server/billing";
import { addDays } from "@/lib/classes";
import { json } from "@/lib/server/util";

/** Members whose plan ends within 7 days, or ended in the last 30 days. */
export async function GET() {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const [members, ms] = await Promise.all([store().allMembers(), T.list("memberships")]);
  const t = today(), floor = addDays(t, -30);
  const rows = members.map((m) => ({ m, plan: planSummary(ms.filter((x) => x.member_id === m.id)) }))
    .filter(({ plan }) => plan.status === "expiring" || (plan.status === "ended" && plan.endsOn! >= floor))
    .sort((a, b) => a.plan.endsOn!.localeCompare(b.plan.endsOn!));
  return json({ renewals: rows.map(({ m, plan }) => ({ id: m.id, name: m.name, phone: m.phone, memberCode: m.memberCode, ...plan })) });
}

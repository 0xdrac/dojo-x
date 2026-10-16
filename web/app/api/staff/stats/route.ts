import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { isRes, staffGuard, today } from "@/lib/server/guard";
import { occursOn } from "@/lib/classes";
import { planSummary } from "@/lib/server/billing";
import { json } from "@/lib/server/util";
import { nextOccurrence } from "@/lib/recur";

export async function GET() {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const d = today(), monthStart = d.slice(0, 8) + "01";
  const [members, trials, att, classes, events, cancels, orders, ms] = await Promise.all([
    store().allMembers(), store().trials(), T.list("attendance", { eq: { on_date: d } }),
    T.list("classes", { eq: { active: true } }), T.list("events", { eq: { published: true } }),
    T.list("class_cancellations", { eq: { on_date: d } }),
    T.list("orders", { eq: { status: "paid" } }), T.list("memberships"),
  ]);
  const plans = members.map((m) => planSummary(ms.filter((x) => x.member_id === m.id)));
  const cancelled = new Set(cancels.map((c) => c.class_id));
  return json({
    date: d,
    members: members.length,
    activeMembers: plans.filter((p) => p.status === "active" || p.status === "expiring").length,
    renewalsDue: plans.filter((p) => p.status === "expiring").length,
    revenueMonth: orders.filter((o) => (o.paid_at ?? "").slice(0, 7) === monthStart.slice(0, 7)).reduce((a, o) => a + o.amount, 0),
    revenueToday: orders.filter((o) => (o.paid_at ?? "").slice(0, 10) === d).reduce((a, o) => a + o.amount, 0),
    newThisMonth: members.filter((m) => m.createdAt.slice(0, 10) >= monthStart).length,
    trialsToday: trials.filter((t) => t.createdAt.slice(0, 10) === d).length,
    trialsOpen: trials.filter((t) => t.status === "booked").length,
    checkinsToday: att.filter((a) => a.status !== "absent").length,
    classesToday: classes.filter((c) => occursOn(c, d) && !cancelled.has(c.id)).length,
    upcomingEvents: events.filter((e) => nextOccurrence(e as any)).length,
  });
}

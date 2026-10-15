import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { isRes, staffGuard, today, weekday } from "@/lib/server/guard";
import { json } from "@/lib/server/util";

export async function GET() {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const d = today(), monthStart = d.slice(0, 8) + "01";
  const [members, trials, att, classes, events, cancels] = await Promise.all([
    store().allMembers(), store().trials(), T.list("attendance", { eq: { on_date: d } }),
    T.list("classes", { eq: { active: true, day: weekday(d) } }), T.list("events", { eq: { published: true }, gte: ["starts_at", new Date().toISOString()] }),
    T.list("class_cancellations", { eq: { on_date: d } }),
  ]);
  const cancelled = new Set(cancels.map((c) => c.class_id));
  return json({
    date: d,
    members: members.length,
    newThisMonth: members.filter((m) => m.createdAt.slice(0, 10) >= monthStart).length,
    trialsToday: trials.filter((t) => t.createdAt.slice(0, 10) === d).length,
    trialsOpen: trials.filter((t) => t.status === "booked").length,
    checkinsToday: att.filter((a) => a.status !== "absent").length,
    classesToday: classes.filter((c) => !cancelled.has(c.id)).length,
    upcomingEvents: events.length,
  });
}

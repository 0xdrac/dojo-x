import { T } from "@/lib/server/tables";
import { today } from "@/lib/server/guard";
import { json } from "@/lib/server/util";
import { describeRepeat, nextOccurrence } from "@/lib/recur";
import { coachesOf, discsOf } from "@/lib/classes";

/** Data the public pages need: the weekly timetable, live coupons and upcoming events. No auth. */
export async function GET() {
  try {
    const [classes, coupons, events] = await Promise.all([
      T.list("classes", { eq: { active: true }, order: ["start_time"] }),
      T.list("coupons", { eq: { status: "active" } }),
      T.list("events", { eq: { published: true } }),
    ]);
    const d = today();
    const cancelled = (await T.list("class_cancellations", { gte: ["on_date", d] })).map((c) => `${c.class_id}|${c.on_date}`);
    return json({
      classes: classes.map((c) => ({ id: c.id, d: c.day, t: c.start_time, dur: c.duration_min, disc: discsOf(c)[0], discs: discsOf(c), title: c.title, coach: coachesOf(c)[0], coaches: coachesOf(c), level: c.level, age: c.age_group, cap: c.capacity, booked: 0 })),
      coupons: coupons
        .filter((c) => (!c.valid_until || c.valid_until >= d) && (!c.cap || c.uses < c.cap))
        .map((c) => ({ code: c.code, type: c.type, v: c.value, until: c.valid_until })),
      events: events
        .map((e) => ({ id: e.id, title: e.title, kind: e.kind, description: e.description, startsAt: nextOccurrence(e as any), repeat: describeRepeat(e as any), location: e.location, price: e.price }))
        .filter((e) => e.startsAt)
        .sort((a, b) => a.startsAt!.localeCompare(b.startsAt!))
        .slice(0, 12),
      cancelled,
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}

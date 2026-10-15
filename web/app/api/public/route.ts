import { T } from "@/lib/server/tables";
import { today } from "@/lib/server/guard";
import { json } from "@/lib/server/util";

/** Data the public pages need: the weekly timetable, live coupons and upcoming events. No auth. */
export async function GET() {
  try {
    const [classes, coupons, events] = await Promise.all([
      T.list("classes", { eq: { active: true }, order: ["start_time"] }),
      T.list("coupons", { eq: { status: "active" } }),
      T.list("events", { eq: { published: true }, gte: ["starts_at", new Date().toISOString()], order: ["starts_at"], limit: 12 }),
    ]);
    const d = today();
    const cancelled = (await T.list("class_cancellations", { gte: ["on_date", d] })).map((c) => `${c.class_id}|${c.on_date}`);
    return json({
      classes: classes.map((c) => ({ id: c.id, d: c.day, t: c.start_time, dur: c.duration_min, disc: c.discipline, title: c.title, coach: c.coach, level: c.level, age: c.age_group, cap: c.capacity, booked: 0 })),
      coupons: coupons
        .filter((c) => (!c.valid_until || c.valid_until >= d) && (!c.cap || c.uses < c.cap))
        .map((c) => ({ code: c.code, type: c.type, v: c.value, until: c.valid_until })),
      events: events.map((e) => ({ id: e.id, title: e.title, kind: e.kind, description: e.description, startsAt: e.starts_at, location: e.location, price: e.price })),
      cancelled,
    });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}

import { T } from "@/lib/server/tables";
import { today } from "@/lib/server/guard";
import { json } from "@/lib/server/util";
import { describeRepeat, nextOccurrence } from "@/lib/recur";
import { addDays, coachesOf, discsOf, endOf, occursOn, startOf } from "@/lib/classes";
import { ensureSchedule } from "@/lib/server/standard";
import { countsBetween } from "@/lib/server/bookings";

/** Data the public pages need: the weekly timetable, live coupons and upcoming events. No auth. */
export async function GET() {
  try {
    await ensureSchedule();
    const d = today(), window7 = Array.from({ length: 7 }, (_, i) => addDays(d, i));
    const [classes, coupons, events, counts, cancelledRows] = await Promise.all([
      T.list("classes", { eq: { active: true }, order: ["start_time"] }),
      T.list("coupons", { eq: { status: "active" } }),
      T.list("events", { eq: { published: true } }),
      countsBetween(d, addDays(d, 6)),
      T.list("class_cancellations", { gte: ["on_date", d] }),
    ]);
    const running = classes.filter((c) => window7.some((x) => occursOn(c, x)));
    const cancelled = cancelledRows.map((c) => `${c.class_id}|${c.on_date}`);
    const res = json({
      classes: running.map((c) => ({ id: c.id, d: c.day, t: c.start_time, dur: c.duration_min, disc: discsOf(c)[0], discs: discsOf(c), title: c.title, coach: coachesOf(c)[0], coaches: coachesOf(c), level: c.level, age: c.age_group, cap: c.capacity, from: startOf(c), to: endOf(c), booked: window7.reduce((n, x) => n + (occursOn(c, x) ? counts[`${c.id}|${x}`]?.booked ?? 0 : 0), 0) })),
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
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
}

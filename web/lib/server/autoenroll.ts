import { T } from "./tables";
import { store } from "./store";
import { istNow } from "./guard";
import { addDays, occursOn } from "@/lib/classes";
import { bookSeat, WINDOW_DAYS } from "./bookings";
import { STANDARD_DISCIPLINES, ensureSchedule } from "./standard";

/** Standard batches: members are in the 7 PM "amateur" batch unless they pick the 8 PM "pro" (intermediate & pro) one. */
export const BATCH_TIME: Record<string, string> = { amateur: "19:00", pro: "20:00" };

let last = 0;

/**
 * Every member with an active boxing / MMA / kickboxing / Muay Thai plan is booked into their batch for each weekday in the next 7 days.
 * Idempotent: a date that already has a booking row (including one the member cancelled) is left alone. Throttled to once a minute.
 */
export async function autoEnroll(force = false) {
  if (!force && Date.now() - last < 60_000) return;
  last = Date.now();
  try {
    await ensureSchedule();
    const today = istNow().date, dates = Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(today, i));
    const [plans, members, classes, prefs] = await Promise.all([T.list("memberships"), store().allMembers(), T.list("classes", { eq: { active: true } }), T.list("batch_prefs")]);
    const std = classes.filter((c) => c.age_group === "Teens & Adults" && Object.values(BATCH_TIME).includes(c.start_time));
    const pref = new Map(prefs.map((p) => [p.member_id, p.batch]));
    const ids = new Set(plans.filter((p) => p.ends_on >= today && p.disciplines.some((d: string) => STANDARD_DISCIPLINES.includes(d))).map((p) => p.member_id));
    for (const m of members.filter((m) => ids.has(m.id))) {
      const time = BATCH_TIME[pref.get(m.id) || "amateur"] || BATCH_TIME.amateur;
      for (const c of std.filter((c) => c.start_time === time)) for (const date of dates) {
        if (!occursOn(c, date) || await T.get("bookings", { member_id: m.id, class_id: c.id, on_date: date })) continue;
        await bookSeat({ id: m.id, dob: m.dob } as any, c.id, date);
      }
    }
  } catch (e: any) { console.warn("[autoEnroll] " + e.message); }
}

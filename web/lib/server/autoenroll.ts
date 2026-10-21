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
export async function autoEnroll(force = false, onlyMemberIds?: string[], known?: any[]) {
  if (!force && Date.now() - last < 60_000) return;
  if (!onlyMemberIds) last = Date.now();
  try {
    await ensureSchedule();
    const today = istNow().date, dates = Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(today, i));
    const scope: [string, any[]] | undefined = onlyMemberIds ? ["member_id", onlyMemberIds] : undefined;
    if (onlyMemberIds && !onlyMemberIds.length) return;
    const [plans, members, classes, prefs, booked] = await Promise.all([
      T.list("memberships", { gte: ["ends_on", today], in: scope }), known ? Promise.resolve(known) : store().allMembers(), T.list("classes", { eq: { active: true } }),
      T.list("batch_prefs", { in: scope }), T.list("bookings", { gte: ["on_date", today], in: scope }),
    ]);
    const std = classes.filter((c) => c.age_group === "Teens & Adults" && Object.values(BATCH_TIME).includes(c.start_time));
    const pref = new Map(prefs.map((p) => [p.member_id, p.batch]));
    const have = new Set(booked.map((b) => `${b.member_id}|${b.class_id}|${b.on_date}`));
    const ids = new Set(plans.filter((p) => p.disciplines.some((d: string) => STANDARD_DISCIPLINES.includes(d))).map((p) => p.member_id));
    for (const m of members.filter((m) => ids.has(m.id))) {
      const time = BATCH_TIME[pref.get(m.id) || "amateur"] || BATCH_TIME.amateur;
      for (const c of std.filter((c) => c.start_time === time)) for (const date of dates) {
        if (!occursOn(c, date) || have.has(`${m.id}|${c.id}|${date}`)) continue;
        const other = std.find((o) => o.start_time !== time && occursOn(o, date) && o.title.split(" · ")[0] === c.title.split(" · ")[0]);
        if (other && have.has(`${m.id}|${other.id}|${date}`)) continue; // already chose the other batch that day
        await bookSeat({ id: m.id, dob: m.dob } as any, c.id, date);
      }
    }
  } catch (e: any) { console.warn("[autoEnroll] " + e.message); }
}

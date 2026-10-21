import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { istNow } from "@/lib/server/guard";
import { CUTOFF_MIN, WINDOW_DAYS } from "@/lib/server/bookings";
import { addDays } from "@/lib/classes";
import { fail, json } from "@/lib/server/util";

/** Everything the portal's class list needs: seats taken per class + date for the next 7 days, and this account's bookings. */
export async function GET() {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const now = istNow(), to = addDays(now.date, WINDOW_DAYS - 1);
  const [members, all] = await Promise.all([store().members(sess.sub), T.list("bookings", { gte: ["on_date", now.date] })]);
  const ids = new Set(members.map((m) => m.id));
  const counts: Record<string, { booked: number; waitlist: number }> = {}, waiting: Record<string, any[]> = {};
  for (const b of all) {
    if (b.status === "cancelled" || b.on_date > to) continue;
    const k = `${b.class_id}|${b.on_date}`; (counts[k] ??= { booked: 0, waitlist: 0 })[b.status === "booked" ? "booked" : "waitlist"]++;
    if (b.status === "waitlist") (waiting[k] ??= []).push(b);
  }
  const order = (a: any, b: any) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : 1);
  const bookings = all.filter((b) => ids.has(b.member_id) && b.status !== "cancelled").map((b) => ({
    id: b.id, memberId: b.member_id, classId: b.class_id, date: b.on_date, status: b.status,
    position: b.status === "waitlist" ? (waiting[`${b.class_id}|${b.on_date}`] ?? []).sort(order).findIndex((x) => x.id === b.id) + 1 : 0,
  }));
  return json({ today: now.date, nowMinutes: now.minutes, cutoffMin: CUTOFF_MIN, counts, bookings });
}

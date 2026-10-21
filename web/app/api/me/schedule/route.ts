import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { istNow } from "@/lib/server/guard";
import { CUTOFF_MIN, WINDOW_DAYS, countsBetween, waitPosition } from "@/lib/server/bookings";
import { addDays } from "@/lib/classes";
import { fail, json } from "@/lib/server/util";

/** Everything the portal's class list needs: seats taken per class + date for the next 7 days, and this account's bookings. */
export async function GET() {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const now = istNow(), to = addDays(now.date, WINDOW_DAYS - 1);
  const members = await store().members(sess.sub), ids = new Set(members.map((m) => m.id));
  const [counts, all] = await Promise.all([countsBetween(now.date, to), T.list("bookings", { gte: ["on_date", now.date] })]);
  const mine = all.filter((b) => ids.has(b.member_id) && b.status !== "cancelled");
  const bookings = [];
  for (const b of mine) bookings.push({ id: b.id, memberId: b.member_id, classId: b.class_id, date: b.on_date, status: b.status, position: b.status === "waitlist" ? await waitPosition(b) : 0 });
  return json({ today: now.date, nowMinutes: now.minutes, cutoffMin: CUTOFF_MIN, counts, bookings });
}

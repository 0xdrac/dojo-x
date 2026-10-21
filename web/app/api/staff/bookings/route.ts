import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { isDate, isRes, staffGuard, today } from "@/lib/server/guard";
import { fail, json } from "@/lib/server/util";

/** GET ?date= -> every booking (booked + waitlist) on that date, with member names. */
export async function GET(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const date = new URL(req.url).searchParams.get("date") || today();
  if (!isDate(date)) return fail("Bad date");
  const [rows, members] = await Promise.all([T.list("bookings", { eq: { on_date: date } }), store().allMembers()]);
  const by = new Map(members.map((m) => [m.id, m]));
  return json({ bookings: rows.filter((r) => r.status !== "cancelled").map((r) => ({ id: r.id, classId: r.class_id, memberId: r.member_id, status: r.status, name: by.get(r.member_id)?.name ?? "Unknown", memberCode: by.get(r.member_id)?.memberCode ?? "" })) });
}

import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { bookSeat } from "@/lib/server/bookings";
import { body, fail, json } from "@/lib/server/util";

/** Book a seat (or join the waitlist when the class is full) for a member of the signed-in account. */
export async function POST(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Please sign in to book.", 401);
  const b = await body(req), member = (await store().members(sess.sub)).find((m) => m.id === b.memberId);
  if (!member) return fail("Member not found.", 404);
  const r = await bookSeat(member, String(b.classId), String(b.date));
  if ("error" in r) return fail(r.error, r.code);
  return json({ ok: true, status: r.status, position: r.position, booking: { id: r.booking.id, classId: r.booking.class_id, date: r.booking.on_date } }, 201);
}

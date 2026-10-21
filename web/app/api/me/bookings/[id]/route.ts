import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { cancelBooking } from "@/lib/server/bookings";
import { fail, json } from "@/lib/server/util";

/** Cancel a booking, or leave the waitlist. Seats can be released up to 2 hours before class. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const sess = await getSession("member"); if (!sess) return fail("Please sign in.", 401);
  const b = await T.get("bookings", { id: (await params).id });
  const mine = b ? (await store().members(sess.sub)).some((m) => m.id === b.member_id) : false;
  if (!b || !mine) return fail("Booking not found.", 404);
  const r = await cancelBooking(b);
  return "error" in r ? fail(r.error, r.code) : json({ ok: true });
}

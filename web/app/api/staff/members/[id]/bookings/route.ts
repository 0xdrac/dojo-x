import { store } from "@/lib/server/store";
import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { bookSeat, fillSeats } from "@/lib/server/bookings";
import { body, fail, json } from "@/lib/server/util";

/** Book a member into a class (same rules as the member app: plan, age, clashes, capacity). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const mid = (await params).id, m = (await store().allMembers()).find((x) => x.id === mid); if (!m) return fail("Member not found", 404);
  const b = await body(req), r = await bookSeat(m, String(b.classId), String(b.date));
  return "error" in r ? fail(r.error, r.code) : json({ ok: true, status: r.status });
}
/** Cancel one of the member's bookings with no cutoff (?booking=id). */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const bk = await T.get("bookings", { id: String(new URL(req.url).searchParams.get("booking")) });
  if (!bk || bk.member_id !== (await params).id) return fail("Booking not found", 404);
  await T.update("bookings", { id: bk.id }, { status: "cancelled", cancel_reason: "Cancelled by staff" });
  if (bk.status === "booked") await fillSeats(bk.class_id, bk.on_date);
  return json({ ok: true });
}

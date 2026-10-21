import { T } from "./tables";
import { istNow } from "./guard";
import { addDays, discsOf, occursOn } from "@/lib/classes";
import type { Member } from "./types";

type Row = Record<string, any>;
/** Members may cancel up to this many minutes before the class starts. */
export const CUTOFF_MIN = 120;
export const WINDOW_DAYS = 7;

const mins = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
const ageOf = (dob?: string | null) => (dob ? Math.floor((Date.now() - +new Date(dob)) / 31557600000) : 30);
export const key = (classId: string, date: string) => `${classId}|${date}`;

/** Seats taken and waitlist length per class + date, for dates in [from, to]. */
export async function countsBetween(from: string, to: string): Promise<Record<string, { booked: number; waitlist: number }>> {
  const rows = await T.list("bookings", { gte: ["on_date", from], lte: ["on_date", to] });
  const out: Record<string, { booked: number; waitlist: number }> = {};
  for (const r of rows) {
    if (r.status === "cancelled") continue;
    const k = key(r.class_id, r.on_date); (out[k] ??= { booked: 0, waitlist: 0 })[r.status === "booked" ? "booked" : "waitlist"]++;
  }
  return out;
}

const byCreated = (a: Row, b: Row) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : 1);

/** Position (1 = next in line) of a waitlisted booking. */
export async function waitPosition(b: Row): Promise<number> {
  const q = (await T.list("bookings", { eq: { class_id: b.class_id, on_date: b.on_date, status: "waitlist" } })).sort(byCreated);
  return q.findIndex((x) => x.id === b.id) + 1;
}

/** Promote waitlisted members into any free seats, oldest first. */
export async function fillSeats(classId: string, date: string) {
  const cls = await T.get("classes", { id: classId }); if (!cls) return;
  const rows = await T.list("bookings", { eq: { class_id: classId, on_date: date } });
  let free = cls.capacity - rows.filter((r) => r.status === "booked").length;
  for (const w of rows.filter((r) => r.status === "waitlist").sort(byCreated)) {
    if (free <= 0) break;
    await T.update("bookings", { id: w.id }, { status: "booked" }); free--;
  }
}

export type BookResult = { error: string; code: number } | { booking: Row; status: "booked" | "waitlist"; position: number };

export async function bookSeat(member: Member, classId: string, date: string): Promise<BookResult> {
  const now = istNow();
  const cls = await T.get("classes", { id: classId });
  if (!cls || !cls.active) return { error: "That class isn’t available.", code: 404 };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < now.date || date > addDays(now.date, WINDOW_DAYS - 1)) return { error: "You can book classes in the next 7 days.", code: 422 };
  if (!occursOn(cls, date)) return { error: "That class doesn’t run on that day.", code: 422 };
  if (await T.get("class_cancellations", { class_id: classId, on_date: date })) return { error: "That class has been cancelled.", code: 409 };
  if (date === now.date && mins(cls.start_time) <= now.minutes) return { error: "That class has already started.", code: 409 };

  const age = ageOf(member.dob);
  if (age < 13 && cls.age_group !== "Kids") return { error: "This class is for older members.", code: 422 };
  if (age >= 13 && cls.age_group === "Kids") return { error: "This is a kids’ class.", code: 422 };

  const discs = discsOf(cls), plans = await T.list("memberships", { eq: { member_id: member.id } });
  if (!plans.some((p) => p.starts_on <= date && p.ends_on >= date && p.disciplines.some((d: string) => discs.includes(d)))) {
    return { error: plans.some((p) => p.ends_on >= date) || plans.length ? "Your plan doesn’t cover this class on that date. Renew or add the discipline in My Plan." : "You need an active plan to book. Pick a plan in My Plan.", code: 402 };
  }

  // can't be in two places at once
  const mine = (await T.list("bookings", { eq: { member_id: member.id, on_date: date, status: "booked" } })).filter((b) => b.class_id !== classId);
  for (const b of mine) {
    const o = await T.get("classes", { id: b.class_id });
    if (o && mins(o.start_time) < mins(cls.start_time) + cls.duration_min && mins(cls.start_time) < mins(o.start_time) + o.duration_min) return { error: `You’re already booked into ${o.title} at that time.`, code: 409 };
  }

  const existing = await T.get("bookings", { member_id: member.id, class_id: classId, on_date: date });
  if (existing && existing.status !== "cancelled") return { error: existing.status === "booked" ? "You’re already booked into this class." : "You’re already on the waitlist.", code: 409 };

  const row = existing ? (await T.update("bookings", { id: existing.id }, { status: "booked", cancel_reason: null, created_at: new Date().toISOString() }))!
    : await T.insert("bookings", { member_id: member.id, class_id: classId, on_date: date, status: "booked" });
  // seats can be contested: re-check after inserting and fall back to the waitlist if we're past capacity
  const seated = (await T.list("bookings", { eq: { class_id: classId, on_date: date, status: "booked" } })).sort(byCreated);
  if (seated.findIndex((b) => b.id === row.id) >= cls.capacity) {
    const w = (await T.update("bookings", { id: row.id }, { status: "waitlist" }))!;
    return { booking: w, status: "waitlist", position: await waitPosition(w) };
  }
  return { booking: row, status: "booked", position: 0 };
}

export async function cancelBooking(booking: Row): Promise<{ error: string; code: number } | { ok: true }> {
  const now = istNow(), cls = await T.get("classes", { id: booking.class_id });
  if (booking.status === "cancelled") return { ok: true };
  if (booking.status === "booked" && cls) {
    const startsIn = (booking.on_date === now.date ? 0 : (+new Date(booking.on_date) - +new Date(now.date)) / 60000) + mins(cls.start_time) - now.minutes;
    if (startsIn < 0) return { error: "That class has already started.", code: 409 };
    if (startsIn < CUTOFF_MIN) return { error: "Bookings can be cancelled up to 2 hours before class. Please speak to the front desk.", code: 409 };
  }
  await T.update("bookings", { id: booking.id }, { status: "cancelled", cancel_reason: "Cancelled by member" });
  if (booking.status === "booked") await fillSeats(booking.class_id, booking.on_date);
  return { ok: true };
}

/** An admin cancelled a date: cancel every booking for it. */
export async function cancelDate(classId: string, date: string) {
  for (const b of await T.list("bookings", { eq: { class_id: classId, on_date: date } })) if (b.status !== "cancelled") await T.update("bookings", { id: b.id }, { status: "cancelled", cancel_reason: "Class cancelled" });
}

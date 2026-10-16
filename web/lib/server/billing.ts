import { T } from "./tables";
import { today } from "./guard";
import { addDays } from "@/lib/classes";

type Row = Record<string, any>;

/** Same calendar day N months later, minus one day (a monthly plan bought 5 Oct runs to 4 Nov). */
export function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(d, last));
  return addDays(t.toISOString().slice(0, 10), -1);
}
export const monthsOf = (duration: string) => ({ monthly: 1, quarterly: 3, half: 6, annual: 12 } as Record<string, number>)[duration] ?? 1;

/** Financial year label for an invoice number, e.g. 2026-27 for dates from 1 Apr 2026 to 31 Mar 2027. */
export function financialYear(date = today()) {
  const y = +date.slice(0, 4), m = +date.slice(5, 7), start = m >= 4 ? y : y - 1;
  return `${start}-${String(start + 1).slice(2)}`;
}
async function nextInvoiceNo(): Promise<string> {
  // Highest number issued this financial year, whatever the order's status now is (a refunded order keeps its number).
  const fy = financialYear(), prefix = `DX/${fy}/`;
  const last = await T.list("orders", { gte: ["invoice_no", prefix], lte: ["invoice_no", prefix + "99999"], order: ["invoice_no", false], limit: 1 });
  const n = last.length ? +last[0].invoice_no.split("/")[2] : 0;
  return `${prefix}${String(n + 1).padStart(5, "0")}`;
}

/** Creates the paid periods for an order: fight disciplines run for the plan length, yoga is always one month. Extends a member's current plan when it overlaps. */
async function grantMemberships(order: Row) {
  const t = today(), fightDisc = order.disciplines.filter((d: string) => d !== "yoga"), yoga = order.disciplines.includes("yoga");
  const groups: [string[], string][] = [];
  if (fightDisc.length) groups.push([fightDisc, order.duration]);
  if (yoga) groups.push([["yoga"], "monthly"]);
  for (const memberId of order.member_ids) {
    const existing = await T.list("memberships", { eq: { member_id: memberId } });
    for (const [discs, dur] of groups) {
      const overlap = existing.filter((m) => m.ends_on >= t && m.disciplines.some((d: string) => discs.includes(d)));
      const start = overlap.length ? addDays(overlap.map((m) => m.ends_on).sort().at(-1)!, 1) : t;
      await T.insert("memberships", { member_id: memberId, order_id: order.id, disciplines: discs, duration: dur, starts_on: start, ends_on: addMonths(start, monthsOf(dur)) });
    }
  }
}

/**
 * Marks an order paid and grants the memberships. Safe to call twice (browser verify + webhook): only the first call that
 * flips status created/failed -> paid does the work.
 */
export async function fulfillOrder(orderId: string, paymentId: string | null, method: string | null): Promise<{ order: Row | null; fresh: boolean }> {
  const current = await T.get("orders", { id: orderId });
  if (!current) return { order: null, fresh: false };
  if (current.status === "paid") return { order: current, fresh: false };
  let claimed: Row | null = null;
  for (let attempt = 0; attempt < 3 && !claimed; attempt++) {
    try {
      claimed = await T.update("orders", { id: orderId, status: current.status }, { status: "paid", razorpay_payment_id: paymentId, method, paid_at: new Date().toISOString(), failure_reason: null, invoice_no: await nextInvoiceNo() });
    } catch (e) { if (attempt === 2) throw e; }                       // invoice number clash: retry with the next number
    if (!claimed) { const again = await T.get("orders", { id: orderId }); if (again?.status === "paid") return { order: again, fresh: false }; break; }
  }
  if (!claimed) return { order: current, fresh: false };
  await grantMemberships(claimed);
  if (claimed.coupon_code) { const c = await T.get("coupons", { code: claimed.coupon_code }); if (c) await T.update("coupons", { code: c.code }, { uses: (c.uses ?? 0) + 1 }); }
  return { order: claimed, fresh: true };
}

export async function failOrder(orderId: string, reason: string) {
  await T.update("orders", { id: orderId, status: "created" }, { status: "failed", failure_reason: reason.slice(0, 300) });
}

/** A member's current plan summary from their memberships. */
export function planSummary(memberships: Row[], at = today()) {
  const live = memberships.filter((m) => m.ends_on >= at);
  if (!live.length) {
    const last = memberships.map((m) => m.ends_on).sort().at(-1) ?? null;
    return { status: last ? "ended" : "none", disciplines: [] as string[], endsOn: last as string | null, startsOn: null as string | null, daysLeft: 0, duration: null as string | null };
  }
  const endsOn = live.map((m) => m.ends_on).sort().at(-1)!, startsOn = live.map((m) => m.starts_on).sort()[0];
  const daysLeft = Math.round((+new Date(endsOn + "T12:00:00Z") - +new Date(at + "T12:00:00Z")) / 864e5);
  const longest = live.slice().sort((a, b) => b.ends_on.localeCompare(a.ends_on))[0];
  return { status: daysLeft <= 7 ? "expiring" : "active", disciplines: [...new Set(live.flatMap((m) => m.disciplines))] as string[], endsOn, startsOn, daysLeft, duration: longest.duration as string };
}

/** Full refund: close the order and end its memberships yesterday. */
export async function refundOrder(orderId: string) {
  await T.update("orders", { id: orderId }, { status: "refunded" });
  for (const m of await T.list("memberships", { eq: { order_id: orderId } })) await T.update("memberships", { id: m.id }, { ends_on: addDays(today(), -1) });
}

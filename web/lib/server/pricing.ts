import DOJO from "@/lib/dojo";
import { T } from "./tables";
import { today } from "./guard";

const D: any = DOJO;
export const DURATIONS = ["monthly", "quarterly", "half", "annual"];
export const durLabel = (k: string) => D.plans[k]?.l ?? k;

/** Looks up a coupon in the database and checks it applies to this purchase. Returns the coupon in the shape D.quote expects. */
export async function resolveCoupon(code: string | null | undefined, ctx: { duration: string; accountId?: string | null }) {
  const c = String(code || "").trim().toUpperCase();
  if (!c) return { coupon: null as any };
  const row = await T.get("coupons", { code: c });
  if (!row) return { error: "We don’t recognise that code." };
  if (row.status !== "active") return { error: "That code is paused." };
  if (row.valid_until && row.valid_until < today()) return { error: `That code expired on ${row.valid_until}.` };
  if (row.cap && row.uses >= row.cap) return { error: "That code has been fully used." };
  if (row.scope === "Quarterly+" && ctx.duration === "monthly") return { error: "That code needs a 3-month or longer plan." };
  if (row.scope === "6 & 12 month plans" && !["half", "annual"].includes(ctx.duration)) return { error: "That code needs a 6 or 12 month plan." };
  if (row.scope === "First plan only" && ctx.accountId) {
    const prior = await T.list("orders", { eq: { account_id: ctx.accountId, status: "paid" }, limit: 1 });
    if (prior.length) return { error: "That code is for a first plan only." };
  }
  return { coupon: { status: "ok", code: row.code, type: row.type, v: row.value } };
}

/** The one place prices are computed for real money. The browser's numbers are never trusted. */
export function quote(disciplines: string[], duration: string, people: number, coupon: any) {
  const q = D.quote(disciplines, duration, people, coupon);
  return {
    amount: q.total as number, gross: q.gross as number, discountPeople: q.peopleOff as number, discountCoupon: q.couponOff as number,
    hasFight: q.fight.length > 0, hasYoga: q.yoga as boolean, planKey: q.pk as string, fight: q.fight as string[],
  };
}
export function validateSelection(disciplines: unknown, duration: unknown, people: unknown): { error?: string; disc?: string[]; dur?: string; n?: number } {
  const disc = Array.isArray(disciplines) ? [...new Set<string>(disciplines.map(String))] : [];
  if (!disc.length || disc.some((k) => !D.disciplines[k])) return { error: "Pick at least one discipline." };
  const dur = String(duration);
  if (!DURATIONS.includes(dur)) return { error: "Pick a plan length." };
  const n = Number(people);
  if (!Number.isInteger(n) || n < 1 || n > 6) return { error: "Choose between 1 and 6 people." };
  return { disc, dur, n };
}

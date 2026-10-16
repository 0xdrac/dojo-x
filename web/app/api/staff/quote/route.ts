import { isRes, staffGuard } from "@/lib/server/guard";
import { quote, resolveCoupon, validateSelection } from "@/lib/server/pricing";
import { body, fail, json } from "@/lib/server/util";

/** Price preview for the front-desk payment form (same maths as the real charge). */
export async function POST(req: Request) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const b = await body(req), n = Number(b.people) || 1;
  const sel = validateSelection(b.disciplines, b.duration, n); if (sel.error) return fail(sel.error);
  const dur = sel.disc!.every((k) => k === "yoga") ? "monthly" : sel.dur!;
  const cr = await resolveCoupon(b.couponCode, { duration: dur, accountId: b.accountId ?? null });
  const q = quote(sel.disc!, dur, n, cr.coupon);
  return json({ ...q, duration: dur, couponError: cr.error ?? null });
}

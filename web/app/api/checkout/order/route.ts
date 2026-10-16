import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { createRazorpayOrder, keyId, razorpayConfigured } from "@/lib/server/razorpay";
import { durLabel, quote, resolveCoupon, validateSelection } from "@/lib/server/pricing";
import { body, fail, json } from "@/lib/server/util";
import DOJO from "@/lib/dojo";

const D: any = DOJO;

/** Step 1 of paying: the server prices the basket and opens a Razorpay order. The browser then opens the popup with it. */
export async function POST(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Please sign in to pay.", 401);
  if (!razorpayConfigured()) return fail("Online payments aren’t switched on yet. Please pay at the front desk.", 503);
  const b = await body(req), sel = validateSelection(b.disciplines, b.duration, b.people);
  if (sel.error) return fail(sel.error);
  const { disc, n } = sel;
  const dur = disc!.every((k) => k === "yoga") ? "monthly" : sel.dur!;

  const s = store(), account = await s.accountById(sess.sub); if (!account) return fail("Please sign in to pay.", 401);
  const members = await s.members(account.id);
  const first = members.find((m) => m.id === b.memberId) ?? members.find((m) => m.rel === "You") ?? members[0];
  if (!first) return fail("Finish your profile before paying.", 409);
  const who = [first, ...members.filter((m) => m.id !== first.id)].slice(0, n);
  if (who.length < n!) return fail(`You chose ${n} people but this account has ${members.length}. Add family members first, or pick fewer.`, 409);

  const cr = await resolveCoupon(b.couponCode, { duration: dur, accountId: account.id });
  if (cr.error) return fail(cr.error, 422);
  const q = quote(disc!, dur, n!, cr.coupon);
  if (q.amount < 1) return fail("Nothing to pay for this selection.");

  const order = await T.insert("orders", {
    account_id: account.id, member_ids: who.map((m) => m.id), disciplines: disc, duration: dur, people: n, coupon_code: cr.coupon?.code ?? null,
    gross: q.gross, discount_people: q.discountPeople, discount_coupon: q.discountCoupon, amount: q.amount, source: "online", status: "created",
  });
  try {
    const rz = await createRazorpayOrder(q.amount, order.id, { order_id: order.id, account: account.phone });
    await T.update("orders", { id: order.id }, { razorpay_order_id: rz.id });
    const me = members.find((m) => m.rel === "You") ?? first;
    return json({
      orderId: order.id, razorpayOrderId: rz.id, amount: q.amount, key: keyId(),
      description: `${durLabel(dur)} · ${disc!.map((k) => D.disciplines[k].name).join(" + ")}${n! > 1 ? ` · ${n} people` : ""}`,
      covers: who.map((m) => m.name), prefill: { name: String(b.name || me.name || ""), email: String(b.email || me.email || ""), contact: "+91" + account.phone },
    });
  } catch (e: any) {
    await T.delete("orders", { id: order.id });
    return fail(`Couldn’t start the payment: ${e.message}`, 502);
  }
}

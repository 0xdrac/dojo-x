import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { isRes, staffGuard } from "@/lib/server/guard";
import { fulfillOrder } from "@/lib/server/billing";
import { quote, resolveCoupon, validateSelection } from "@/lib/server/pricing";
import { body, fail, json } from "@/lib/server/util";

export async function GET() {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const [orders, members] = await Promise.all([T.list("orders", { order: ["created_at", false], limit: 300 }), store().allMembers()]);
  const byId = new Map(members.map((m) => [m.id, m]));
  return json({
    payments: orders.filter((o) => o.status !== "created").map((o) => ({
      ...o, razorpay_order_id: undefined,
      names: o.member_ids.map((id: string) => byId.get(id)?.name ?? "Unknown"),
      phone: byId.get(o.member_ids[0])?.phone ?? "",
    })),
  });
}

/** Record a payment taken at the front desk (cash, UPI to the shop QR, card machine). Activates the plan immediately. */
export async function POST(req: Request) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const b = await body(req);
  const ids: string[] = Array.isArray(b.memberIds) ? [...new Set<string>(b.memberIds.map(String))] : [];
  if (!ids.length) return fail("Pick who is paying.");
  const all = await store().allMembers(), who = ids.map((id) => all.find((m) => m.id === id));
  if (who.some((m) => !m)) return fail("Member not found.", 404);
  const sel = validateSelection(b.disciplines, b.duration, ids.length); if (sel.error) return fail(sel.error);
  const dur = sel.disc!.every((k) => k === "yoga") ? "monthly" : sel.dur!;
  if (!["cash", "upi", "card"].includes(b.method)) return fail("Pick how they paid.");
  const accountId = who[0]!.accountId;
  const cr = await resolveCoupon(b.couponCode, { duration: dur, accountId }); if (cr.error) return fail(cr.error, 422);
  const q = quote(sel.disc!, dur, ids.length, cr.coupon);
  let amount = q.amount;
  if (b.amount !== undefined && b.amount !== "" && Number(b.amount) !== q.amount) {
    if (g.staff.role !== "owner") return fail("Only the owner can change the amount.", 403);
    const n = Number(b.amount); if (!Number.isInteger(n) || n < 1) return fail("Enter the amount received in rupees."); amount = n;
  }
  const order = await T.insert("orders", {
    account_id: accountId, member_ids: ids, disciplines: sel.disc, duration: dur, people: ids.length, coupon_code: cr.coupon?.code ?? null,
    gross: q.gross, discount_people: q.discountPeople, discount_coupon: q.discountCoupon, amount, source: "desk", status: "created", recorded_by: g.staff.id,
  });
  const { order: paid } = await fulfillOrder(order.id, null, b.method);
  return json({ order: paid }, 201);
}

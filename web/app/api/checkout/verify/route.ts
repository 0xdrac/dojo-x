import { T } from "@/lib/server/tables";
import { getSession } from "@/lib/server/session";
import { fetchPaymentMethod, verifyPayment } from "@/lib/server/razorpay";
import { fulfillOrder } from "@/lib/server/billing";
import { body, fail, json } from "@/lib/server/util";

/** Step 2: the popup returned a payment. Check Razorpay's signature, then activate the membership. */
export async function POST(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Please sign in.", 401);
  const b = await body(req);
  const order = await T.get("orders", { id: String(b.orderId) });
  if (!order || order.account_id !== sess.sub) return fail("Order not found.", 404);
  if (order.razorpay_order_id !== b.razorpay_order_id) return fail("That payment doesn’t match this order.", 400);
  if (!verifyPayment(b.razorpay_order_id, String(b.razorpay_payment_id), String(b.razorpay_signature))) return fail("We couldn’t verify that payment. If money left your account it will be matched automatically within a few minutes.", 400);
  const { order: paid } = await fulfillOrder(order.id, String(b.razorpay_payment_id), await fetchPaymentMethod(String(b.razorpay_payment_id)));
  return json({ ok: true, order: { id: paid!.id, invoiceNo: paid!.invoice_no, amount: paid!.amount, method: paid!.method, paymentId: paid!.razorpay_payment_id } });
}

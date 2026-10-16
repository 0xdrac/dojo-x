import { T } from "@/lib/server/tables";
import { verifyWebhook } from "@/lib/server/razorpay";
import { failOrder, fulfillOrder, refundOrder } from "@/lib/server/billing";
import { json } from "@/lib/server/util";

/**
 * Razorpay -> us. Covers the case where someone pays and closes the tab before the browser can verify.
 * In Razorpay: Settings -> Webhooks, URL https://<site>/api/razorpay/webhook, events payment.captured, payment.failed, order.paid, refund.processed.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) return json({ error: "bad signature" }, 400);
  let ev: any; try { ev = JSON.parse(raw); } catch { return json({ error: "bad body" }, 400); }
  const pay = ev.payload?.payment?.entity, rzOrderId = pay?.order_id ?? ev.payload?.order?.entity?.id;

  if (ev.event === "payment.captured" || ev.event === "order.paid") {
    const order = rzOrderId ? await T.get("orders", { razorpay_order_id: rzOrderId }) : null;
    if (order) await fulfillOrder(order.id, pay?.id ?? null, pay?.method ?? null);
  } else if (ev.event === "payment.failed") {
    const order = rzOrderId ? await T.get("orders", { razorpay_order_id: rzOrderId }) : null;
    if (order) await failOrder(order.id, pay?.error_description || "Payment failed");
  } else if (ev.event === "refund.processed") {
    const refund = ev.payload?.refund?.entity;
    const order = refund?.payment_id ? await T.get("orders", { razorpay_payment_id: refund.payment_id }) : null;
    if (order && refund.amount >= order.amount * 100) await refundOrder(order.id);
  }
  return json({ ok: true });
}

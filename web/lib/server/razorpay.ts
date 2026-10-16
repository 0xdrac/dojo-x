import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay Standard Checkout, server side. Uses the REST API directly (no SDK).
 * RAZORPAY_MOCK=1 fakes Razorpay for local development; it is ignored in production.
 */
const mock = () => process.env.RAZORPAY_MOCK === "1" && process.env.NODE_ENV !== "production";
export const razorpayConfigured = () => mock() || !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
export const keyId = () => (mock() ? "rzp_test_mock" : process.env.RAZORPAY_KEY_ID!);
const secret = () => (mock() ? "mock_secret" : process.env.RAZORPAY_KEY_SECRET!);

const hmac = (key: string, data: string) => createHmac("sha256", key).update(data).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function createRazorpayOrder(amountRupees: number, receipt: string, notes: Record<string, string>): Promise<{ id: string }> {
  if (mock()) return { id: "order_mock_" + Math.random().toString(36).slice(2, 12) };
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId()}:${secret()}`).toString("base64") },
    body: JSON.stringify({ amount: amountRupees * 100, currency: "INR", receipt, notes }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error?.description || `Razorpay error ${res.status}`);
  return j;
}

/** Signature the browser gets back from the popup: HMAC(order_id|payment_id) with the key secret. */
export const signPayment = (orderId: string, paymentId: string) => hmac(secret(), `${orderId}|${paymentId}`);
export const verifyPayment = (orderId: string, paymentId: string, signature: string) => !!signature && same(signPayment(orderId, paymentId), signature);

/** Webhook: HMAC of the raw request body with the webhook secret. */
export function verifyWebhook(raw: string, signature: string | null): boolean {
  const ws = mock() ? "mock_webhook" : process.env.RAZORPAY_WEBHOOK_SECRET;
  return !!ws && !!signature && same(hmac(ws, raw), signature);
}
export const signWebhook = (raw: string) => hmac("mock_webhook", raw);

/** Fetch a payment to learn its method (upi / card / netbanking / wallet). */
export async function fetchPaymentMethod(paymentId: string): Promise<string | null> {
  if (mock()) return "upi";
  try {
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, { headers: { Authorization: "Basic " + Buffer.from(`${keyId()}:${secret()}`).toString("base64") } });
    return res.ok ? ((await res.json()) as any).method ?? null : null;
  } catch { return null; }
}

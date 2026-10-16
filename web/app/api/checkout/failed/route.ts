import { T } from "@/lib/server/tables";
import { getSession } from "@/lib/server/session";
import { failOrder } from "@/lib/server/billing";
import { body, fail, json } from "@/lib/server/util";

/** The popup reported a failed attempt. Recorded for the admin; the same order can still succeed on a retry. */
export async function POST(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Please sign in.", 401);
  const b = await body(req), order = await T.get("orders", { id: String(b.orderId) });
  if (!order || order.account_id !== sess.sub) return fail("Order not found.", 404);
  await failOrder(order.id, String(b.reason || "Payment failed"));
  return json({ ok: true });
}

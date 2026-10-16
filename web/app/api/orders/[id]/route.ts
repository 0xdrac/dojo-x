import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";

/** One order for the invoice page. The owning member, or any staff member, may read it. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const order = await T.get("orders", { id: (await params).id });
  if (!order) return fail("Not found", 404);
  const m = await getSession("member"), st = await getSession("staff");
  if (!(st || (m && m.sub === order.account_id))) return fail("Not found", 404);
  const s = store(), all = await s.allMembers();
  return json({
    order: { ...order, razorpay_order_id: undefined },
    members: order.member_ids.map((id: string) => all.find((x) => x.id === id)).filter(Boolean).map((x: any) => ({ name: x.name, memberCode: x.memberCode })),
    phone: all.find((x) => x.accountId === order.account_id)?.phone ?? null,
  });
}

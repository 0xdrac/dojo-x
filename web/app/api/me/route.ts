import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";
import { T } from "@/lib/server/tables";

export async function GET() {
  const sess = await getSession("member");
  if (!sess) return fail("Not signed in", 401);
  const s = store(), account = await s.accountById(sess.sub);
  if (!account) return fail("Not signed in", 401);
  const members = await s.members(account.id);
  const ids = new Set(members.map((m) => m.id));
  // Plans and payments come from tables added with the payments update. If the database hasn't been migrated yet, sign-in must still work.
  const soft = async <T,>(p: Promise<T[]>): Promise<T[]> => { try { return await p; } catch (e: any) { console.warn("[api/me] " + e.message + " — run supabase/schema.sql"); return []; } };
  const [allMs, orders] = await Promise.all([soft(T.list("memberships")), soft(T.list("orders", { eq: { account_id: account.id }, order: ["created_at", false], limit: 40 }))]);
  return json({ memberships: allMs.filter((m) => ids.has(m.member_id)), orders: orders.filter((o) => o.status !== "created").map((o) => ({ ...o, razorpay_order_id: undefined })), account: { id: account.id, phone: account.phone }, members, onboarded: members.some((m) => m.rel === "You") });
}

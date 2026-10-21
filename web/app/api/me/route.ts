import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";
import { autoEnroll } from "@/lib/server/autoenroll";
import { T } from "@/lib/server/tables";

export async function GET() {
  const sess = await getSession("member");
  if (!sess) return fail("Not signed in", 401);
  const s = store(), [account, members] = await Promise.all([s.accountById(sess.sub), s.members(sess.sub)]);
  if (!account) return fail("Not signed in", 401);
  const ids = new Set(members.map((m) => m.id)), idList = [...ids];
  // Plans and payments come from tables added with the payments update. If the database hasn't been migrated yet, sign-in must still work.
  const soft = async <T,>(p: Promise<T[]>): Promise<T[]> => { try { return await p; } catch (e: any) { console.warn("[api/me] " + e.message + " — run supabase/schema.sql"); return []; } };
  const enrolled = autoEnroll(true, idList, members);
  const prefs = await soft(T.list("batch_prefs", { in: ["member_id", idList] }));
  const [allMs, orders] = await Promise.all([soft(T.list("memberships", { in: ["member_id", idList] })), soft(T.list("orders", { eq: { account_id: account.id }, order: ["created_at", false], limit: 40 }))]);
  await enrolled;
  return json({ memberships: allMs.filter((m) => ids.has(m.member_id)), orders: orders.filter((o) => o.status !== "created").map((o) => ({ ...o, razorpay_order_id: undefined })), trials: (await s.trials().catch(() => [])).filter((t) => t.accountId === account.id || t.phone === account.phone).slice(0, 3), account: { id: account.id, phone: account.phone }, members: members.map((m) => ({ ...m, batch: prefs.find((p) => p.member_id === m.id)?.batch || "amateur" })), onboarded: members.some((m) => m.rel === "You") });
}

import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";

export async function GET() {
  const sess = await getSession("member");
  if (!sess) return fail("Not signed in", 401);
  const s = store(), account = await s.accountById(sess.sub);
  if (!account) return fail("Not signed in", 401);
  const members = await s.members(account.id);
  return json({ account: { id: account.id, phone: account.phone }, members, onboarded: members.some((m) => m.rel === "You") });
}

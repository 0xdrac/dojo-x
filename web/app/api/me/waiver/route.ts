import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, fail, json, str } from "@/lib/server/util";

/** Records the signed waiver for the owner, or for another member of the account when memberId is given. */
export async function POST(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const b = await body(req), s = store(), all = await s.members(sess.sub);
  const target = b.memberId ? all.find((m) => m.id === b.memberId) : all.find((m) => m.rel === "You");
  if (!target) return fail("Save your profile first.", 409);
  const by = str(b.by, 120); if (!by) return fail("Add the signer's name.");
  const m = await s.updateMember(sess.sub, target.id, {
    waiver: { signed: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), by, type: b.type === "Typed" ? "Typed" : "Drawn" },
  });
  return json({ member: m });
}

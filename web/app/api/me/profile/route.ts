import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, digits, fail, json, str } from "@/lib/server/util";

/** Create or update the account owner's own profile (step 1 of onboarding, and Profile edits in the portal). */
export async function PUT(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const b = await body(req), name = str(b.name);
  if (name.split(" ").filter(Boolean).length < 2) return fail("Enter your first and last name.");
  const email = str(b.email, 160);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail("That email looks incomplete.");
  const patch = {
    name, dob: str(b.dob, 10) || null, email: email || null, gender: str(b.gender, 20) || null,
    emergency: b.ename || b.ephone ? { name: str(b.ename), phone: digits(b.ephone) } : null,
  };
  const s = store(), me = (await s.members(sess.sub)).find((m) => m.rel === "You");
  const m = me ? await s.updateMember(sess.sub, me.id, patch) : await s.addMember({ accountId: sess.sub, rel: "You", ...patch });
  return json({ member: m });
}

import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, digits, fail, json, str, validPhone } from "@/lib/server/util";

/** Create or update the account owner's own profile (step 1 of onboarding, and Profile edits in the portal). */
export async function PUT(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const b = await body(req), name = str(b.name);
  if (name.split(" ").filter(Boolean).length < 2) return fail("Enter your first and last name.");
  const email = str(b.email, 160);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return fail("That email looks incomplete.");
  const ageOf = (d: string) => { const b = new Date(d), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; };
  const dobStr = str(b.dob, 10);
  if (dobStr && !/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) return fail("Enter a valid date of birth.");
  if (dobStr && ageOf(dobStr) < 18 && (!str(b.ename) || digits(b.ephone).length !== 10)) return fail("Members under 18 need a parent or guardian’s name and 10-digit mobile number.");
  const patch = {
    name, dob: str(b.dob, 10) || null, email: email || null, gender: str(b.gender, 20) || null,
    emergency: b.ename || b.ephone ? { name: str(b.ename), phone: digits(b.ephone) } : null,
  };
  const s = store();
  if (b.mobile !== undefined) {
    const ph = digits(b.mobile); if (!validPhone(ph)) return fail("Enter a valid 10-digit mobile number.");
    const acc = await s.accountById(sess.sub), other = await s.accountByPhone(ph);
    if (other && other.id !== sess.sub) return fail("That mobile number is already used by another account.", 409);
    if (acc && acc.phone !== ph) await s.setAccountPhone(sess.sub, ph);
  }
  const me = (await s.members(sess.sub)).find((m) => m.rel === "You");
  const m = me ? await s.updateMember(sess.sub, me.id, patch) : await s.addMember({ accountId: sess.sub, rel: "You", ...patch });
  return json({ member: m });
}

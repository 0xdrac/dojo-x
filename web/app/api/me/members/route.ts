import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, fail, json, str } from "@/lib/server/util";

const RELS = ["Child", "Spouse", "Parent", "Sibling"];

export async function POST(req: Request) {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const b = await body(req), name = str(b.name);
  if (!name) return fail("Enter a name.");
  const rel = RELS.includes(b.rel) ? b.rel : "Child";
  const s = store(), me = (await s.members(sess.sub)).find((m) => m.rel === "You");
  const m = await s.addMember({
    accountId: sess.sub, rel, name, dob: str(b.dob, 10) || null, gender: str(b.gender, 20) || null,
    emergency: me ? { name: me.name, phone: (await s.accountById(sess.sub))?.phone ?? "" } : null,
    // A parent's signed waiver covers their child; other relatives sign for themselves.
    waiver: rel === "Child" && me?.waiver ? { signed: me.waiver.signed, by: `${me.name} (guardian)`, type: me.waiver.type } : null,
  });
  return json({ member: m }, 201);
}

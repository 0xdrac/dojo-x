import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, fail, json, str } from "@/lib/server/util";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const b = await body(req), patch: Record<string, unknown> = {};
  if (b.name !== undefined) { patch.name = str(b.name); if (!patch.name) return fail("Enter a name."); }
  if (b.dob !== undefined) patch.dob = str(b.dob, 10) || null;
  if (b.email !== undefined) patch.email = str(b.email, 160) || null;
  if (b.gender !== undefined) patch.gender = str(b.gender, 20) || null;
  const m = await store().updateMember(sess.sub, (await params).id, patch);
  return m ? json({ member: m }) : fail("Member not found", 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const sess = await getSession("member"); if (!sess) return fail("Not signed in", 401);
  const s = store(), id = (await params).id, target = (await s.members(sess.sub)).find((m) => m.id === id);
  if (!target) return fail("Member not found", 404);
  if (target.rel === "You") return fail("You can’t remove the account owner.", 409);
  await s.deleteMember(sess.sub, id);
  return json({ ok: true });
}

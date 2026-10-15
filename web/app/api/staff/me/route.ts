import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { fail, json } from "@/lib/server/util";

export async function GET() {
  const sess = await getSession("staff"); if (!sess) return fail("Not signed in", 401);
  const staff = await store().staffById(sess.sub);
  return staff ? json({ staff: { id: staff.id, name: staff.name, role: staff.role, coachKey: staff.coachKey ?? null } }) : fail("Not signed in", 401);
}

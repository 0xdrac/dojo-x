import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, fail, json } from "@/lib/server/util";

async function staff() { const sess = await getSession("staff"); return sess ? store().staffById(sess.sub) : null; }

export async function GET() {
  if (!(await staff())) return fail("Staff only", 401);
  return json({ trials: await store().trials() });
}
export async function PATCH(req: Request) {
  if (!(await staff())) return fail("Staff only", 401);
  const b = await body(req);
  if (!["booked", "attended", "no-show", "joined"].includes(b.status)) return fail("Bad status");
  const t = await store().setTrialStatus(String(b.id), b.status);
  return t ? json({ trial: t }) : fail("Trial not found", 404);
}

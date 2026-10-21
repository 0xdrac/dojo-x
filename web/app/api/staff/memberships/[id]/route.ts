import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { body, fail, json } from "@/lib/server/util";
import { membershipRow } from "@/lib/server/validate";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const id = (await params).id; if (!(await T.get("memberships", { id }))) return fail("Plan not found", 404);
  const v = membershipRow(await body(req)); if (v.error) return fail(v.error);
  return json({ membership: await T.update("memberships", { id }, v.row!) });
}
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  await T.delete("memberships", { id: (await params).id });
  return json({ ok: true });
}

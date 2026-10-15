import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { eventRow } from "@/lib/server/validate";
import { body, fail, json } from "@/lib/server/util";

type Ctx = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const v = eventRow(await body(req), true); if (v.error) return fail(v.error);
  const e = await T.update("events", { id: (await params).id }, v.row!);
  return e ? json({ event: e }) : fail("Event not found", 404);
}
export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  return (await T.delete("events", { id: (await params).id })) ? json({ ok: true }) : fail("Event not found", 404);
}

import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { classRow } from "@/lib/server/validate";
import { body, fail, json } from "@/lib/server/util";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const v = classRow(await body(req), true); if (v.error) return fail(v.error);
  const c = await T.update("classes", { id: (await params).id }, v.row!);
  return c ? json({ class: c }) : fail("Class not found", 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const id = (await params).id;
  await T.delete("class_cancellations", { class_id: id }); await T.delete("class_sessions", { class_id: id });
  return (await T.delete("classes", { id })) ? json({ ok: true }) : fail("Class not found", 404);
}

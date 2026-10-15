import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { body, fail, json } from "@/lib/server/util";

type Ctx = { params: Promise<{ code: string }> };
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const b = await body(req);
  if (b.status !== "active" && b.status !== "paused") return fail("Bad status");
  const c = await T.update("coupons", { code: (await params).code }, { status: b.status });
  return c ? json({ coupon: c }) : fail("Coupon not found", 404);
}
export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  return (await T.delete("coupons", { code: (await params).code })) ? json({ ok: true }) : fail("Coupon not found", 404);
}

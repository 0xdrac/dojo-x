import { T } from "@/lib/server/tables";
import { ensureClasses } from "@/lib/server/seed";
import { isRes, staffGuard } from "@/lib/server/guard";
import { classRow } from "@/lib/server/validate";
import { body, fail, json } from "@/lib/server/util";

export async function GET() {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  await ensureClasses();
  const [classes, cancellations] = await Promise.all([T.list("classes", { order: ["start_time"] }), T.list("class_cancellations")]);
  return json({ classes, cancellations });
}

export async function POST(req: Request) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const v = classRow(await body(req)); if (v.error) return fail(v.error);
  return json({ class: await T.insert("classes", { ...v.row, active: true }) }, 201);
}

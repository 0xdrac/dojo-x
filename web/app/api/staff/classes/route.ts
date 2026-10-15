import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { classRow } from "@/lib/server/validate";
import { body, fail, json } from "@/lib/server/util";

export async function GET() {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const [classes, cancellations] = await Promise.all([T.list("classes", { order: ["start_time"] }), T.list("class_cancellations")]);
  return json({ classes, cancellations });
}

export async function POST(req: Request) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const v = classRow(await body(req)); if (v.error) return fail(v.error);
  return json({ class: await T.insert("classes", { ...v.row, active: true }) }, 201);
}

/** Remove every class from the weekly schedule (owner only). */
export async function DELETE() {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const all = await T.list("classes");
  for (const c of all) { await T.delete("class_cancellations", { class_id: c.id }); await T.delete("class_sessions", { class_id: c.id }); await T.delete("classes", { id: c.id }); }
  return json({ ok: true, removed: all.length });
}

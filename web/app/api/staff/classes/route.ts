import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { classRow } from "@/lib/server/validate";
import { ensureSchedule } from "@/lib/server/standard";
import { body, fail, json } from "@/lib/server/util";

export async function GET() {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  await ensureSchedule();
  const [classes, cancellations] = await Promise.all([T.list("classes", { order: ["start_time"] }), T.list("class_cancellations")]);
  return json({ classes, cancellations });
}

export async function POST(req: Request) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const b = await body(req);
  // `days` creates the same class on several weekdays in one go (one row per day).
  const days: number[] = Array.isArray(b.days) && b.days.length ? [...new Set<number>(b.days.map(Number))] : [Number(b.day)];
  if (days.length > 7) return fail("Pick at most 7 days.");
  const rows: Record<string, any>[] = [];
  for (const d of days) { const v = classRow({ ...b, day: d }); if (v.error) return fail(v.error); rows.push({ ...v.row, active: true }); }
  const created = [];
  for (const r of rows) created.push(await T.insert("classes", r));
  return json({ class: created[0], classes: created }, 201);
}

/** Remove every class from the weekly schedule (owner only). */
export async function DELETE() {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const all = await T.list("classes");
  for (const c of all) { await T.delete("class_cancellations", { class_id: c.id }); await T.delete("class_sessions", { class_id: c.id }); await T.delete("classes", { id: c.id }); }
  return json({ ok: true, removed: all.length });
}

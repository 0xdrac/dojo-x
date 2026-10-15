import { T } from "@/lib/server/tables";
import { isDate, isRes, staffGuard, weekday } from "@/lib/server/guard";
import { body, fail, json } from "@/lib/server/util";

/** Cancel (or restore) one date of a weekly class. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const id = (await params).id, b = await body(req);
  if (!isDate(b.date)) return fail("Pick a date.");
  const c = await T.get("classes", { id }); if (!c) return fail("Class not found", 404);
  if (weekday(b.date) !== c.day) return fail("That date isn’t a day this class runs.");
  if (b.cancelled === false) await T.delete("class_cancellations", { class_id: id, on_date: b.date });
  else await T.upsert("class_cancellations", { class_id: id, on_date: b.date }, {});
  return json({ ok: true });
}

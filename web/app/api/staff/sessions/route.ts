import { T } from "@/lib/server/tables";
import { isDate, isRes, staffGuard, today } from "@/lib/server/guard";
import { body, fail, json, str } from "@/lib/server/util";

/** GET ?classId=&date= → the class note / submitted state. */
export async function GET(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const u = new URL(req.url), classId = u.searchParams.get("classId"), date = u.searchParams.get("date") || today();
  if (!classId || !isDate(date)) return fail("Missing class or date");
  return json({ session: await T.get("class_sessions", { class_id: classId, on_date: date }) });
}
/** PUT {classId, date, note, submit?} → save the note; submit=true locks in the register. */
export async function PUT(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const b = await body(req), date = b.date || today();
  if (!b.classId || !isDate(date)) return fail("Missing class or date");
  if (!(await T.get("classes", { id: b.classId }))) return fail("Class not found", 404);
  const patch: Record<string, any> = { note: str(b.note, 1000) || null };
  if (b.submit) { patch.submitted_at = new Date().toISOString(); patch.submitted_by = g.staff.id; }
  return json({ session: await T.upsert("class_sessions", { class_id: b.classId, on_date: date }, patch) });
}

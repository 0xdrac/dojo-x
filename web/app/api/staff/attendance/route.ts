import { T } from "@/lib/server/tables";
import { store } from "@/lib/server/store";
import { isDate, isRes, staffGuard, today } from "@/lib/server/guard";
import { body, fail, json } from "@/lib/server/util";

/** GET ?date=&classId= → attendance rows for the day (with member names). */
export async function GET(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const u = new URL(req.url), date = u.searchParams.get("date") || today(), classId = u.searchParams.get("classId");
  if (!isDate(date)) return fail("Bad date");
  const rows = await T.list("attendance", { eq: { on_date: date, ...(classId ? { class_id: classId } : {}) }, order: ["created_at", false] });
  const members = new Map((await store().allMembers()).map((m) => [m.id, m]));
  return json({ attendance: rows.map((r) => ({ ...r, name: members.get(r.member_id)?.name ?? "Unknown", memberCode: members.get(r.member_id)?.memberCode ?? "" })) });
}

/** POST {memberId, classId?, date?, status, source?} → mark (or change) one member's attendance. */
export async function POST(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const b = await body(req), date = b.date || today();
  if (!isDate(date)) return fail("Bad date");
  if (!["present", "late", "absent"].includes(b.status)) return fail("Bad status");
  const member = (await store().allMembers()).find((m) => m.id === b.memberId);
  if (!member) return fail("Member not found", 404);
  const classId = b.classId || null;
  if (classId && !(await T.get("classes", { id: classId }))) return fail("Class not found", 404);
  // one row per member + class + date
  const existing = (await T.list("attendance", { eq: { member_id: member.id, on_date: date } })).find((r) => (r.class_id ?? null) === classId);
  const row = existing
    ? await T.update("attendance", { id: existing.id }, { status: b.status, marked_by: g.staff.id })
    : await T.insert("attendance", { member_id: member.id, class_id: classId, on_date: date, status: b.status, source: g.staff.role === "coach" ? "coach" : b.source === "coach" ? "coach" : "desk", marked_by: g.staff.id });
  return json({ attendance: row }, existing ? 200 : 201);
}

export async function DELETE(req: Request) {
  const g = await staffGuard(); if (isRes(g)) return g.res;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return fail("Missing id");
  return (await T.delete("attendance", { id })) ? json({ ok: true }) : fail("Not found", 404);
}

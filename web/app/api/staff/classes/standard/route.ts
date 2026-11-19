import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { STANDARD_DISCIPLINES, missingStandard, standardClasses } from "@/lib/server/standard";
import { discsOf } from "@/lib/classes";
import { body, json } from "@/lib/server/util";

/**
 * Owner action: replace every existing boxing / kickboxing / Muay Thai / MMA class with the standard Mon-Fri evening batches.
 * Classes for other disciplines (karate, gymnastics, yoga, ...) are left alone.
 */
export async function POST(req: Request) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  // { mode: "add" } only adds the standard batches that are missing (e.g. the new morning batch). Nothing is removed and no bookings are touched.
  if ((await body(req)).mode === "add") {
    const add = missingStandard(await T.list("classes")), created = [];
    for (const row of add) created.push(await T.insert("classes", row));
    return json({ ok: true, removed: 0, created: created.length });
  }
  const old = (await T.list("classes")).filter((c) => discsOf(c).every((d) => STANDARD_DISCIPLINES.includes(d)));
  for (const c of old) {
    for (const t of ["bookings", "class_cancellations", "class_sessions"]) await T.delete(t, { class_id: c.id });
    await T.delete("classes", { id: c.id });
  }
  const created = [];
  for (const row of standardClasses()) created.push(await T.insert("classes", row));
  return json({ ok: true, removed: old.length, created: created.length });
}

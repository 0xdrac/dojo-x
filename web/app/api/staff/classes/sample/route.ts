import { T } from "@/lib/server/tables";
import { ensureClasses } from "@/lib/server/seed";
import { isRes, staffGuard } from "@/lib/server/guard";
import { fail, json } from "@/lib/server/util";

/** Owner-triggered: load the design's sample timetable, only when the schedule is empty. */
export async function POST() {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  if ((await T.list("classes", { limit: 1 })).length) return fail("The schedule already has classes. Clear it first.", 409);
  await ensureClasses();
  return json({ ok: true });
}

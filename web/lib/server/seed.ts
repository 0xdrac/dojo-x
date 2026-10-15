import DOJO from "@/lib/dojo";
import { T } from "./tables";

/** First run: copy the design's sample weekly timetable into the database so the admin has something to edit. */
export async function ensureClasses() {
  if ((await T.list("classes", { limit: 1 })).length) return;
  const rows = (DOJO.classes as any[]).map((c) => ({
    day: c.d, start_time: c.t, duration_min: c.dur, discipline: c.disc, title: c.title, coach: c.coach,
    level: c.level, age_group: c.age, capacity: c.cap, active: true,
  }));
  for (const r of rows) await T.insert("classes", r);
}

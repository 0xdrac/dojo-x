import DOJO from "@/lib/dojo";
import { str } from "./util";
import { istDate, istWeekday } from "@/lib/recur";

const DISCS = DOJO.order as string[];
const COACHES = DOJO.coachOrder as string[];
const AGES = ["Kids", "Teens", "Adults"];
const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"];

/** Validates a weekly class payload. Returns the DB row, or an error message. */
export function classRow(b: any, partial = false): { row?: Record<string, any>; error?: string } {
  const row: Record<string, any> = {};
  const has = (k: string) => b[k] !== undefined;
  if (!partial || has("day")) { const d = Number(b.day); if (!Number.isInteger(d) || d < 0 || d > 6) return { error: "Pick a day." }; row.day = d; }
  if (!partial || has("startTime")) { const t = str(b.startTime, 5); if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return { error: "Enter a start time like 18:30." }; row.start_time = t; }
  if (!partial || has("durationMin")) { const n = Number(b.durationMin); if (!Number.isInteger(n) || n < 15 || n > 240) return { error: "Duration must be 15–240 minutes." }; row.duration_min = n; }
  if (!partial || has("disciplines")) {
    const d = Array.isArray(b.disciplines) ? [...new Set<string>(b.disciplines)] : [];
    if (!d.length || d.some((k) => !DISCS.includes(k))) return { error: "Pick at least one discipline." };
    row.disciplines = d; row.discipline = d[0];
  }
  if (!partial || has("title")) { const t = str(b.title, 80); if (!t) return { error: "Give the class a title." }; row.title = t; }
  if (!partial || has("coaches")) {
    const c = Array.isArray(b.coaches) ? [...new Set<string>(b.coaches)] : [];
    if (!c.length || c.some((k) => !COACHES.includes(k))) return { error: "Pick at least one coach." };
    row.coaches = c; row.coach = c[0];
  }
  if (!partial || has("level")) { if (!LEVELS.includes(b.level)) return { error: "Pick a level." }; row.level = b.level; }
  if (!partial || has("ageGroup")) { if (!AGES.includes(b.ageGroup)) return { error: "Pick an age group." }; row.age_group = b.ageGroup; }
  if (!partial || has("capacity")) { const n = Number(b.capacity); if (!Number.isInteger(n) || n < 1 || n > 200) return { error: "Capacity must be 1–200." }; row.capacity = n; }
  if (has("active")) row.active = !!b.active;
  if (has("startDate") || has("endDate")) {
    const ok = (d: unknown) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
    const a = b.startDate ? String(b.startDate) : null, e = b.endDate ? String(b.endDate) : null;
    if ((a && !ok(a)) || (e && !ok(e))) return { error: "Pick valid dates." };
    if (a && e && e < a) return { error: "The end date can’t be before the start date." };
    row.start_date = a; row.end_date = e;
  }
  return { row };
}

export const KINDS = ["Fight Night", "Grading", "Seminar", "Workshop", "Event"];
export function eventRow(b: any, partial = false): { row?: Record<string, any>; error?: string } {
  const row: Record<string, any> = {}, has = (k: string) => b[k] !== undefined;
  if (!partial || has("title")) { const t = str(b.title, 120); if (!t) return { error: "Give the event a title." }; row.title = t; }
  if (!partial || has("kind")) { if (!KINDS.includes(b.kind)) return { error: "Pick an event type." }; row.kind = b.kind; }
  if (!partial || has("startsAt")) { const d = new Date(b.startsAt); if (isNaN(+d)) return { error: "Pick a date and time." }; row.starts_at = d.toISOString(); }
  if (has("description")) row.description = str(b.description, 1000) || null;
  if (has("location")) row.location = str(b.location, 160) || null;
  if (has("price")) { const n = Number(b.price || 0); if (!Number.isInteger(n) || n < 0 || n > 1000000) return { error: "Price must be a whole number of rupees." }; row.price = n; }
  if (has("capacity")) { const n = b.capacity === "" || b.capacity == null ? null : Number(b.capacity); if (n !== null && (!Number.isInteger(n) || n < 1)) return { error: "Capacity must be a whole number." }; row.capacity = n; }
  if (has("published")) row.published = !!b.published;
  if (has("repeatDays") || has("repeatUntil")) {
    const days = Array.isArray(b.repeatDays) ? [...new Set<number>(b.repeatDays.map(Number))] : [];
    if (!days.length) { row.repeat_days = null; row.repeat_until = null; }   // one-off
    else {
      if (days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) return { error: "Pick valid days of the week." };
      if (!row.starts_at) return { error: "Set the start date and time." };
      const first = istDate(+new Date(row.starts_at));
      const until = String(b.repeatUntil || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) return { error: "Pick when the repeat ends." };
      if (until < first) return { error: "The repeat can’t end before it starts." };
      if (+new Date(until) - +new Date(first) > 366 * 864e5) return { error: "Repeats can run for at most a year." };
      days.push(istWeekday(+new Date(row.starts_at)));         // the first date always counts
      row.repeat_days = [...new Set(days)].sort((a, c) => a - c); row.repeat_until = until;
    }
  }
  return { row };
}

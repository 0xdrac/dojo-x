import DOJO from "@/lib/dojo";
import { str } from "./util";

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
  if (!partial || has("discipline")) { if (!DISCS.includes(b.discipline)) return { error: "Pick a discipline." }; row.discipline = b.discipline; }
  if (!partial || has("title")) { const t = str(b.title, 80); if (!t) return { error: "Give the class a title." }; row.title = t; }
  if (!partial || has("coach")) { if (!COACHES.includes(b.coach)) return { error: "Pick a coach." }; row.coach = b.coach; }
  if (!partial || has("level")) { if (!LEVELS.includes(b.level)) return { error: "Pick a level." }; row.level = b.level; }
  if (!partial || has("ageGroup")) { if (!AGES.includes(b.ageGroup)) return { error: "Pick an age group." }; row.age_group = b.ageGroup; }
  if (!partial || has("capacity")) { const n = Number(b.capacity); if (!Number.isInteger(n) || n < 1 || n > 200) return { error: "Capacity must be 1–200." }; row.capacity = n; }
  if (has("active")) row.active = !!b.active;
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
  return { row };
}

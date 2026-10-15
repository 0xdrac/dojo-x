/** Weekly recurrence for events. Shared by the API (server) and the admin form (browser). Dates are reckoned in IST. */
const IST = 5.5 * 3600e3, DAY = 864e5;
export const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Calendar date (YYYY-MM-DD) and weekday (0 = Mon) of an instant, in IST. */
export const istDate = (ms: number) => new Date(ms + IST).toISOString().slice(0, 10);
export const istWeekday = (ms: number) => (new Date(ms + IST).getUTCDay() + 6) % 7;

export type Recurring = { starts_at: string; repeat_days?: number[] | null; repeat_until?: string | null };
export const isRecurring = (e: Recurring) => !!(e.repeat_days && e.repeat_days.length && e.repeat_until);

/** Every occurrence (as ISO instants) from `fromMs` on, up to `limit`. A one-off event has a single occurrence. */
export function occurrences(e: Recurring, fromMs = Date.now(), limit = 50): string[] {
  const start = +new Date(e.starts_at);
  if (!isRecurring(e)) return start >= fromMs ? [e.starts_at] : [];
  const days = new Set(e.repeat_days!), out: string[] = [];
  for (let k = 0; k <= 400 && out.length < limit; k++) {
    const t = start + k * DAY;
    if (istDate(t) > e.repeat_until!) break;
    if (t >= fromMs && days.has(istWeekday(t))) out.push(new Date(t).toISOString());
  }
  return out;
}
export const nextOccurrence = (e: Recurring, fromMs = Date.now()) => occurrences(e, fromMs, 1)[0] ?? null;
/** Total sessions in the whole series (used for the "14 sessions" summary). */
export const totalSessions = (e: Recurring) => occurrences(e, 0, 500).length;

export function describeRepeat(e: Recurring): string {
  if (!isRecurring(e)) return "";
  const d = [...e.repeat_days!].sort((a, b) => a - b).map((i) => SHORT[i]);
  return `Every ${d.length === 7 ? "day" : d.join(", ")} until ${new Date(e.repeat_until + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

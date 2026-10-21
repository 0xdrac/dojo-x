/** A class can have several disciplines and coaches. These helpers work on DB rows and on the public objects alike. */
export const discsOf = (c: any): string[] => (c.disciplines?.length ? c.disciplines : c.discs?.length ? c.discs : [c.discipline ?? c.disc]).filter(Boolean);
export const coachesOf = (c: any): string[] => (c.coaches?.length ? c.coaches : [c.coach]).filter(Boolean);

/** Adds discs / coaches / discNames / coachNames to classes (used by the public screens). `disc` and `coach` stay as the first of each. */
export function normalizeClasses(list: any[], D: any) {
  for (const c of list) {
    c.discs = discsOf(c); c.disc = c.discs[0];
    c.coaches = coachesOf(c); c.coach = c.coaches[0];
    c.discNames = c.discs.map((k: string) => D.disciplines[k]?.name ?? k).join(" + ");
    c.coachNames = c.coaches.map((k: string) => D.coaches[k]?.first ?? k).join(" & ");
  }
  return list;
}

/** 0 = Monday ... 6 = Sunday for a YYYY-MM-DD calendar date. */
export const weekdayOf = (date: string) => (new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7;
const addDays = (date: string, n: number) => new Date(+new Date(date + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);
export const startOf = (c: any): string | null => c.start_date ?? c.from ?? null;
export const endOf = (c: any): string | null => c.end_date ?? c.to ?? null;

/** Does this class run on `date`? Weekly on its weekday, between its start and end dates when it has them. */
export function occursOn(c: any, date: string): boolean {
  if ((c.day ?? c.d) !== weekdayOf(date)) return false;
  const a = startOf(c), b = endOf(c);
  return (!a || date >= a) && (!b || date <= b);
}
/** Number of sessions of a class between two dates (inclusive); used for the "18 classes" summary. */
export function countSessions(day: number, from: string, to: string): number {
  let n = 0; for (let d = from, k = 0; d <= to && k < 400; d = addDays(d, 1), k++) if (weekdayOf(d) === day) n++; return n;
}
export const nextDateOnOrAfter = (from: string, day: number) => { let d = from; for (let k = 0; k < 7 && weekdayOf(d) !== day; k++) d = addDays(d, 1); return d; };
export { addDays };

/** Free trials can only be booked for these weekdays (0 = Monday ... 3 = Thursday). */
export const TRIAL_WEEKDAYS = [0, 1, 2, 3];

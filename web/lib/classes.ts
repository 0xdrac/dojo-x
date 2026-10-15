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

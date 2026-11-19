/** The academy's standard Mon-Fri batches for boxing, kickboxing, Muay Thai and MMA: 11-12 morning, 7-8 PM amateur, 8-9 PM intermediate & pro (teens and adults together). */
export const STANDARD_DISCIPLINES = ["mma", "boxing", "kickboxing", "muaythai"];

const BATCHES: { time: string; label: string; level: string; coaches?: string[] }[] = [
  { time: "11:00", label: "Morning", level: "All levels", coaches: ["aman"] },
  { time: "19:00", label: "Amateur", level: "Beginner" },
  { time: "20:00", label: "Intermediate & Pro", level: "Intermediate" },
];
const DAYS: { day: number; name: string; disciplines: string[]; coaches: string[] }[] = [
  { day: 0, name: "Boxing", disciplines: ["boxing"], coaches: ["vishal"] },
  { day: 1, name: "Kickboxing & Muay Thai", disciplines: ["kickboxing", "muaythai"], coaches: ["vishal"] },
  { day: 2, name: "Jiu-Jitsu", disciplines: ["mma"], coaches: ["vishal"] },
  { day: 3, name: "MMA Fundamentals", disciplines: ["mma"], coaches: ["vishal"] },
  { day: 4, name: "Sparring", disciplines: ["mma", "boxing", "kickboxing", "muaythai"], coaches: ["vishal"] },
];

export const standardClasses = () =>
  DAYS.flatMap((d) => BATCHES.map((b) => ({
    day: d.day, start_time: b.time, duration_min: 60, title: `${d.name} · ${b.label}`,
    discipline: d.disciplines[0], disciplines: d.disciplines, coach: (b.coaches ?? d.coaches)[0], coaches: b.coaches ?? d.coaches,
    level: b.level, age_group: "Teens & Adults", capacity: 25, active: true,
  })));

/** Members should always see a weekly timetable: if the academy has no classes at all, create the standard batches once. */
export async function ensureSchedule() {
  const { T } = await import("./tables");
  if ((await T.list("classes", { limit: 1 })).length) return;
  for (const row of standardClasses()) await T.insert("classes", row);
}

/** The standard batches that aren't in the timetable yet (matched by day, time and title), so they can be added without touching anything else. */
export const missingStandard = (existing: Record<string, any>[]) =>
  standardClasses().filter((c) => !existing.some((e) => e.day === c.day && e.start_time === c.start_time && e.title === c.title));

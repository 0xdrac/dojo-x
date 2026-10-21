/** The academy's standard Mon-Fri evening batches for boxing, kickboxing, Muay Thai and MMA (teens and adults together). */
export const STANDARD_DISCIPLINES = ["mma", "boxing", "kickboxing", "muaythai"];

const BATCHES: { time: string; label: string; level: string }[] = [
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
    discipline: d.disciplines[0], disciplines: d.disciplines, coach: d.coaches[0], coaches: d.coaches,
    level: b.level, age_group: "Teens & Adults", capacity: 25, active: true,
  })));

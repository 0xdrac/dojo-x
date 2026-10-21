export const PHONE = "+91 98450 21734";
export const PHONE_TEL = "+919845021734";
export const WA = "919845021734";
export const EMAIL = "train@dojox.in";
export const MAPS =
  "https://maps.google.com/?q=Sai+Complex+Plot+510+Maharaja+Agarsain+Marg+Sector+12+Vasundhara+Ghaziabad+201012";

export const NAV = [
  ["Programs", "/programs"], ["Schedule", "/schedule"], ["Coaches", "/coaches"], ["Pricing", "/pricing"],
  ["Gallery", "/gallery"], ["About", "/about"], ["Contact", "/contact"],
] as const;

export const DISCIPLINES = [
  { slug: "mma", name: "MMA", hue: 15, price: 4999, blurb: "Strike, wrestle, submit. The complete fight game.", ph: "MMA · cage clinch, side-lit" },
  { slug: "boxing", name: "Boxing", hue: 75, price: 4999, blurb: "Footwork, head movement, and hands that hit hard.", ph: "BOXING · wraps being tied" },
  { slug: "kickboxing", name: "Kickboxing", hue: 50, price: 4999, blurb: "Punches and kicks in high-tempo rounds.", ph: "KICKBOXING · roundhouse mid-air" },
  { slug: "muaythai", name: "Muay Thai", hue: 300, price: 4999, blurb: "The art of eight limbs. Elbows, knees, clinch.", ph: "MUAY THAI · knee in the clinch" },
  { slug: "karate", name: "Karate", hue: 100, price: 4999, blurb: "Kyokushin-based. Discipline earned belt by belt.", ph: "KARATE · kata, belt knot detail" },
  { slug: "gymnastics", name: "Gymnastics", hue: 235, price: 4999, blurb: "Strength, flexibility and body control for all ages.", ph: "GYMNASTICS · rings / handstand" },
  { slug: "yoga", name: "Yoga", hue: 165, price: 2599, blurb: "Mobility, breath and recovery. Your reset button.", ph: "YOGA · dawn light, held pose" },
] as const;

export const hue = (h: number) => `oklch(0.74 0.12 ${h})`;
export const hueOf = (name: string) => DISCIPLINES.find((d) => d.name === name)!.hue;

export const STATS = [
  { n: 12, plus: true, label: "YEARS ON THE MAT" },
  { n: 40, plus: true, label: "PRO FIGHTERS" },
  { n: 500, plus: true, label: "BELTS AWARDED" },
  { n: 7, plus: false, label: "DISCIPLINES, ONE ROOF" },
];

export const COACHES = [
  { id: "aman", num: "01", first: "Aman", nick: "", last: "", role: "COACH", ph: "AMAN · portrait, side-lit", rec: null, info: [] as [string, string][], bars: [] as [string, number][], tags: ["MMA", "Boxing", "Kickboxing", "Muay Thai"] },
  { id: "vishal", num: "02", first: "Vishal", nick: "", last: "", role: "COACH · EVENING BATCHES", ph: "VISHAL · portrait, side-lit", rec: null, info: [] as [string, string][], bars: [] as [string, number][], tags: ["MMA", "Boxing", "Kickboxing", "Muay Thai"] },
] as const;

export const REVIEWS = [
  { q: "Walked in unable to do ten push-ups. Eight months later I had my first amateur bout. The coaches don't let you coast.", who: "Siddharth Rao", meta: "MEMBER SINCE 2024", tag: "MMA" },
  { q: "My daughter is nine. Strict, safe, and gradings are taken seriously. She's an orange belt now and twice as confident.", who: "Priya Nair", meta: "PARENT · KIDS BATCH", tag: "Karate" },
  { q: "Kavya's evening Muay Thai is the hardest hour of my week, and the best one.", who: "Ishaan Kapoor", meta: "MEMBER SINCE 2023", tag: "Muay Thai" },
  { q: "Came for yoga, stayed for boxing. The space is spotless and the 6 AM yoga batch is genuinely calm.", who: "Neha Bhattacharya", meta: "YOGA + BOXING COMBO", tag: "Yoga" },
  { q: "Booking takes ten seconds, UPI Autopay just works, and the front desk actually remembers your name.", who: "Farhan Qureshi", meta: "MEMBER SINCE 2025", tag: "Kickboxing" },
];

export const PLANS = {
  monthly: { m: 1, p: 4999, l: "Monthly" },
  quarterly: { m: 3, p: 11999, l: "Quarterly" },
  half: { m: 6, p: 19999, l: "6 months" },
  annual: { m: 12, p: 29999, l: "Annual" },
} as const;
export type PlanKey = keyof typeof PLANS;
export const YOGA_PRICE = 2599;
export const TIERS: [PlanKey, string, string][] = [
  ["monthly", "MONTHLY", "₹4,999"], ["quarterly", "3 MONTHS", "₹11,999"],
  ["half", "6 MONTHS", "₹19,999"], ["annual", "12 MONTHS", "₹29,999"],
];
export const DURS: [PlanKey, string, string][] = [
  ["monthly", "1 Mo", "Flexible"], ["quarterly", "3 Mo", "Save 20%"],
  ["half", "6 Mo", "Save 33%"], ["annual", "12 Mo", "Save 50%"],
];
export const fmt = (v: number) => "₹" + Math.round(v).toLocaleString("en-IN");

export const GALLERY = [
  { id: "gal-1", ph: "FIGHT NIGHT · walkout, crowd haze", cap: "FIGHT NIGHT 09 · DEC 2025", cls: "g-big" },
  { id: "gal-2", ph: "Hand wraps close-up" },
  { id: "gal-3", ph: "Kids karate grading" },
  { id: "gal-4", ph: "Heavy bag row, wide", cap: "THE FLOOR · 6,000 SQ FT", cls: "g-wide" },
];

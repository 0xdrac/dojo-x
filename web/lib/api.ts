/* eslint-disable */
// @ts-nocheck
// Browser-side client for the /api routes. Exposed to the ported screens as window.DojoAPI (see bootstrap.ts).
import DXP from "./portal";
import DOJO from "./dojo";

type R = { ok: boolean; status: number; error?: string; [k: string]: any };

export async function call(method: string, url: string, data?: any): Promise<R> {
  try {
    const res = await fetch(url, { method, headers: data ? { "Content-Type": "application/json" } : undefined, body: data ? JSON.stringify(data) : undefined, credentials: "same-origin" });
    const j = await res.json().catch(() => ({}));
    return { ...j, ok: res.ok, status: res.status, error: res.ok ? undefined : j.error || "Something went wrong. Try again." };
  } catch {
    return { ok: false, status: 0, error: "Can’t reach the server. Check your connection." };
  }
}

const SAMPLE = Object.fromEntries(Object.entries(DXP.members).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]));
const SAMPLE_STATS = { ...DXP.stats }, SAMPLE_PAY = { ...DXP.payments };
const DEMO_PHONE = "9845021734";
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const age = (iso?: string | null) => { if (!iso) return 30; const d = new Date(iso), n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; return Math.max(0, a); };
const initials = (name: string) => name.split(" ").filter(Boolean).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
const fmtPhone = (p: string) => (p && p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : "—");
const NO_PLAN = () => ({ disc: [], dur: "monthly", start: "—", end: "—", daysLeft: 0, totalDays: 1, mode: "manual", via: "No plan yet", status: "none", next: "Pick a plan to get started" });

export const DojoAPI = {
  requestOtp: (phone: string) => call("POST", "/api/auth/request", { phone }),
  verify: (phone: string, code: string) => call("POST", "/api/auth/verify", { phone, code }),
  logout: () => call("POST", "/api/auth/logout"),
  me: () => call("GET", "/api/me"),
  saveProfile: (f: any) => call("PUT", "/api/me/profile", f),
  signWaiver: (w: any) => call("POST", "/api/me/waiver", w),
  addMember: (m: any) => call("POST", "/api/me/members", m),
  removeMember: (id: string) => call("DELETE", `/api/me/members/${id}`),
  bookTrial: (t: any) => call("POST", "/api/trials", t),
  staffMe: () => call("GET", "/api/staff/me"),
  staffTrials: () => call("GET", "/api/staff/trials"),
  staffMembers: () => call("GET", "/api/staff/members"),
  setTrialStatus: (id: string, status: string) => call("PATCH", "/api/staff/trials", { id, status }),

  /** Loads the signed-in account into DXP (the portal's data object). Resolves false when not signed in. */
  async syncPortal(): Promise<boolean> {
    const r = await call("GET", "/api/me");
    if (!r.ok || !r.members?.length) return false;
    const demo = r.account.phone === DEMO_PHONE, members: any = {}, order: string[] = [];
    for (const m of r.members) {
      const first = m.name.split(" ")[0], sid = demo ? first.toLowerCase() : "", sample = SAMPLE[sid];
      const id = sample ? sid : m.id;
      const base: any = {
        id, name: m.name, first, init: initials(m.name), age: age(m.dob), phone: m.rel === "You" || m.rel === "Spouse" ? fmtPhone(r.account.phone) : "— (uses parent)",
        email: m.email || "—", dob: fmtDate(m.dob), gender: m.gender || "—", memberId: m.memberCode, since: fmtDate(m.createdAt).replace(/^\d+ /, ""),
        rel: m.rel === "You" ? "You · Account owner" : m.rel === "Child" ? `Child · ${age(m.dob)} yrs` : m.rel,
        emergency: m.emergency ? { name: m.emergency.name, rel: "Contact", phone: fmtPhone(m.emergency.phone) } : { name: "—", rel: "", phone: "—" },
        waiver: m.waiver ? { signed: m.waiver.signed, by: m.waiver.by, type: m.waiver.type } : { signed: "Not signed", by: "—", type: "—" },
        plan: NO_PLAN(), streak: 0, best: 0, belt: null, bookings: 0, dbId: m.id,
      };
      members[id] = sample ? { ...base, plan: sample.plan, streak: sample.streak, best: sample.best, belt: sample.belt, bookings: sample.bookings } : base;
      DXP.stats[id] = SAMPLE_STATS[id] || { month: 0, hours: 0, last: 0, fav: "—", split: [] };
      DXP.payments[id] = SAMPLE_PAY[id] || [];
      order.push(id);
    }
    DXP.members = members; DXP.order = order;
    if (!members[DXP.current()]) DXP.set(order[0]);
    return true;
  },

  /** Resolves the signed-in staff member, or sends the browser to /login. */
  async requireStaff(roles?: string[]): Promise<any | null> {
    const r = await call("GET", "/api/staff/me");
    if (!r.ok) { (window as any).__dxShell?.go("/login"); return null; }
    if (roles && !roles.includes(r.staff.role)) { (window as any).__dxShell?.go(r.staff.role === "coach" ? "/coach-app" : "/admin"); return null; }
    return r.staff;
  },
};

let publicLoad: Promise<void> | null = null;
/** Replaces the prototype's sample timetable / coupons / announcements with the live ones from /api/public (once per page load). */
export function loadPublic(): Promise<void> {
  if (publicLoad) return publicLoad;
  publicLoad = (async () => {
    const r = await call("GET", "/api/public");
    if (!r.ok || !r.classes) return;           // keep the sample data if the API is unavailable
    const todayIdx = (new Date().getDay() + 6) % 7, d = new Date(), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const off = new Set(r.cancelled || []);
    DOJO.classes = r.classes.filter((c: any) => !(c.d === todayIdx && off.has(`${c.id}|${iso}`)));
    DOJO.coupons = Object.fromEntries((r.coupons || []).map((c: any) => [c.code, { type: c.type, v: c.v, label: c.type === "pct" ? `${c.v}% off` : `₹${c.v} off` }]));
    DXP.announcements = (r.events || []).slice(0, 3).map((e: any) => [
      e.kind.toUpperCase(), e.title,
      `${new Date(e.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}${e.repeat ? " · " + e.repeat.toLowerCase() : ""}${e.location ? " · " + e.location : ""}${e.price ? " · ₹" + e.price : " · Free"}`, "",
    ]);
  })();
  return publicLoad;
}

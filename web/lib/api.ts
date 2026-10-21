/* eslint-disable */
// @ts-nocheck
// Browser-side client for the /api routes. Exposed to the ported screens as window.DojoAPI (see bootstrap.ts).
import DXP from "./portal";
import { confirmFirebaseCode, firebaseEnabled, sendFirebaseCode } from "./firebase";
import DOJO from "./dojo";
import { addDays, normalizeClasses, occursOn, weekdayOf } from "./classes";

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
const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayDiff = (a: string, b: string) => Math.round((+new Date(b + "T12:00:00") - +new Date(a + "T12:00:00")) / 864e5);
const METHOD: any = { upi: "UPI", card: "Card", netbanking: "Netbanking", wallet: "Wallet", cash: "Cash", emi: "EMI" };
/** Builds the portal's plan object from a member's real memberships; null when they have never paid. */
function planFromMemberships(ms: any[], orders: any[]) {
  if (!ms.length) return null;
  const t = todayLocal(), live = ms.filter((x) => x.ends_on >= t);
  if (!live.length) {
    const last = ms.map((x) => x.ends_on).sort().at(-1)!;
    return { ...NO_PLAN(), end: fmtDate(last), via: `Plan ended ${fmtDate(last)}`, next: "Renew to start again" };
  }
  const end = live.map((x) => x.ends_on).sort().at(-1)!, start = live.map((x) => x.starts_on).sort()[0];
  const daysLeft = Math.max(0, dayDiff(t, end)), longest = live.slice().sort((a, b) => b.ends_on.localeCompare(a.ends_on))[0];
  const o = orders.filter((x) => x.status === "paid").sort((a, b) => (b.paid_at || "").localeCompare(a.paid_at || ""))[0];
  return {
    disc: [...new Set(live.flatMap((x) => x.disciplines))], dur: longest.duration, start: fmtDate(start), end: fmtDate(end), daysLeft, totalDays: Math.max(1, dayDiff(start, end) + 1),
    mode: "manual", status: daysLeft <= 7 ? "expiring" : "active",
    via: o ? (o.source === "desk" ? `Paid at the front desk · ${METHOD[o.method] || "cash"}` : `Paid online · ${METHOD[o.method] || "Razorpay"}`) : "Paid", next: `Renew by ${fmtDate(end)}`,
  };
}
const NO_PLAN = () => ({ disc: [], dur: "monthly", start: "—", end: "—", daysLeft: 0, totalDays: 1, mode: "manual", via: "No plan yet", status: "none", next: "Pick a plan to get started" });

export const DojoAPI = {
  createOrder: (b: any) => call("POST", "/api/checkout/order", b),
  verifyPayment: (b: any) => call("POST", "/api/checkout/verify", b),
  reportPaymentFailure: (orderId: string, reason: string) => call("POST", "/api/checkout/failed", { orderId, reason }),
  getOrder: (id: string) => call("GET", `/api/orders/${id}`),
  /** Loads Razorpay's checkout.js once and resolves with its constructor. */
  loadRazorpay(): Promise<any> {
    const w = window as any;
    if (w.Razorpay) return Promise.resolve(w.Razorpay);
    return new Promise((resolve, reject) => {
      const el = document.createElement("script"); el.src = "https://checkout.razorpay.com/v1/checkout.js"; el.async = true;
      el.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay failed to load")));
      el.onerror = () => reject(new Error("Razorpay failed to load"));
      document.head.appendChild(el);
    });
  },
  setBatch: (memberId: string, batch: string) => call("POST", "/api/batch", { memberId, batch }),
  bookClass: (memberId: string, classId: string, date: string) => call("POST", "/api/me/bookings", { memberId, classId, date }),
  cancelBooking: (id: string) => call("DELETE", `/api/me/bookings/${id}`),
  loadSchedule,
  requestOtp: async (phone: string) => (firebaseEnabled() ? { ...(await sendFirebaseCode(phone)), status: 200 } : call("POST", "/api/auth/request", { phone })),
  verify: async (phone: string, code: string) => {
    if (!firebaseEnabled()) return call("POST", "/api/auth/verify", { phone, code });
    const c = await confirmFirebaseCode(code);
    return c.ok ? call("POST", "/api/auth/verify", { phone, idToken: c.idToken }) : { ok: false, status: 401, error: c.error };
  },
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
    const r = await (takePre("me") ?? call("GET", "/api/me"));
    if (!r.ok && r.status !== 401) { (window as any).__dxShell?.toast("Something went wrong loading your account. Please try again."); throw new Error(r.error); }
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
        plan: NO_PLAN(), streak: 0, best: 0, belt: null, bookings: 0, dbId: m.id, batch: m.batch || "amateur",
      };
      const myOrders = (r.orders || []).filter((o: any) => o.member_ids.includes(m.id));
      const real = planFromMemberships((r.memberships || []).filter((x: any) => x.member_id === m.id), myOrders);
      members[id] = sample ? { ...base, plan: real || base.plan, streak: sample.streak, best: sample.best, belt: sample.belt, bookings: sample.bookings } : { ...base, plan: real || base.plan };
      DXP.stats[id] = SAMPLE_STATS[id] || { month: 0, hours: 0, last: 0, fav: "—", split: [] };
      const rows = myOrders.map((o: any) => [
        o.invoice_no || "ORD-" + o.id.slice(0, 8).toUpperCase(), fmtDate(o.paid_at || o.created_at),
        `${DOJO.plans[o.duration]?.l ?? o.duration} · ${o.disciplines.map((k: string) => DOJO.disciplines[k]?.name ?? k).join(" + ")}`,
        o.amount, o.status === "paid" ? "Paid" : o.status === "refunded" ? "Refunded" : "Failed", o.source === "desk" ? "Front desk" : METHOD[o.method] || "Razorpay", o.id,
        { d: o.disciplines.join(","), dur: o.duration, p: o.people },
      ]);
      DXP.payments[id] = rows.length ? rows : (sample ? SAMPLE_PAY[id] || [] : []);
      order.push(id);
    }
    DXP.members = members; DXP.order = order; DXP.trials = r.trials || [];
    if (!members[DXP.current()]) DXP.set(order[0]);
    await loadSchedule();
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

/**
 * Builds the portal's list of bookable classes: every class occurrence in the next 7 days with its live seat count,
 * plus this account's bookings. Stored on DXP.schedule.
 */
async function loadSchedule(): Promise<boolean> {
  const [r] = await Promise.all([takePre("sched") ?? call("GET", "/api/me/schedule"), loadPublic()]);
  if (!r.ok) return false;
  const off: Set<string> = DOJO.cancelledSet || new Set(), occ: any[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(r.today, i);
    for (const c of DOJO.classes) {
      if (!occursOn(c, date) || off.has(`${c.id}|${date}`)) continue;
      const ct = r.counts[`${c.id}|${date}`] || { booked: 0, waitlist: 0 };
      occ.push({ ...c, id: `${c.id}|${date}`, cid: c.id, date, off: i, d: weekdayOf(date), booked: ct.booked, waitN: ct.waitlist });
    }
  }
  DXP.schedule = { ...r, loadedAt: Date.now(), occ };
  return true;
}

/** Requests the portal needs, started before its code has even loaded so they run in parallel instead of one after another. */
const pre: Record<string, { p: Promise<R>; t: number }> = {};
const takePre = (k: string) => { const x = pre[k]; delete pre[k]; return x && Date.now() - x.t < 15000 ? x.p : null; };
export function prefetchPortal() {
  if (typeof window === "undefined") return;
  pre.me = { p: call("GET", "/api/me"), t: Date.now() }; pre.sched = { p: call("GET", "/api/me/schedule"), t: Date.now() };
  loadPublic();
}

let publicLoad: Promise<void> | null = null;
/** Replaces the prototype's sample timetable / coupons / announcements with the live ones from /api/public (once per page load). */
export function loadPublic(): Promise<void> {
  if (publicLoad) return publicLoad;
  publicLoad = (async () => {
    const r = await call("GET", "/api/public");
    if (!r.ok || !r.classes) return;           // keep the sample data if the API is unavailable
    const todayIdx = (new Date().getDay() + 6) % 7, d = new Date(), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const off = new Set(r.cancelled || []);
    DOJO.cancelledSet = new Set(r.cancelled || []);
    DOJO.classes = normalizeClasses(r.classes, DOJO).filter((c: any) => !(c.d === todayIdx && off.has(`${c.id}|${iso}`)));
    DOJO.coupons = Object.fromEntries((r.coupons || []).map((c: any) => [c.code, { type: c.type, v: c.v, label: c.type === "pct" ? `${c.v}% off` : c.type === "set" ? `Plan for ₹${c.v}` : `₹${c.v} off` }]));
    DXP.announcements = (r.events || []).slice(0, 3).map((e: any) => [
      e.kind.toUpperCase(), e.title,
      `${new Date(e.startsAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}${e.repeat ? " · " + e.repeat.toLowerCase() : ""}${e.location ? " · " + e.location : ""}${e.price ? " · ₹" + e.price : " · Free"}`, "",
    ]);
  })();
  return publicLoad;
}

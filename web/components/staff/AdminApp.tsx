"use client";
import { useCallback, useEffect, useState } from "react";
import { useShell } from "@/components/Shell";
import { addDays, countSessions, endOf, nextDateOnOrAfter, occursOn, startOf, weekdayOf } from "@/lib/classes";
import { describeRepeat, istWeekday, totalSessions } from "@/lib/recur";
import { Chips, Multi, coachNames, coachesOf, discNames, discsOf, DAYS, DAYS_LONG, Field, Sheet, D, api, coachName, fmtDay, fmtWhen, hueColor, http, initials, nextDateFor, time12, toLocalInput, useLoad, wd, ymd } from "./ui";

type View = "dash" | "members" | "checkin" | "payments" | "schedule" | "events" | "coupons" | "trials";
const NAV: [View, string, string][] = [
  ["dash", "Dashboard", "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z"],
  ["members", "Members", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"],
  ["checkin", "Check-in", "M4 12l5 5L20 6"],
  ["payments", "Payments", "M3 7h18v12H3zM3 11h18M7 15h3"],
  ["schedule", "Schedule", "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"],
  ["events", "Events", "M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.2L12 17.2 6.5 20.1l1-6.2L3 9.5l6.3-.9z"],
  ["coupons", "Coupons", "M3 9V6h18v3a3 3 0 0 0 0 6v3H3v-3a3 3 0 0 0 0-6zM9 6v12"],
  ["trials", "Trials", "M5 4h14v16H5zM9 9h6M9 13h6"],
];
const Icon = ({ d }: { d: string }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;

const rupees = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const PLAN_TONE: Record<string, string> = { active: "oklch(0.78 0.14 150)", expiring: "oklch(0.82 0.14 75)", ended: "oklch(0.78 0.16 40)", none: "var(--dim)" };
const planLabel = (p: any) => !p ? "NO PLAN" : p.status === "active" ? `ACTIVE · ${p.daysLeft}D LEFT` : p.status === "expiring" ? `EXPIRES IN ${p.daysLeft}D` : p.status === "ended" ? `ENDED ${fmtDay(p.endsOn).toUpperCase()}` : "NO PLAN";
const waLink = (phone: string, text: string) => `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;

export default function AdminApp() {
  const { go } = useShell();
  const [staff, setStaff] = useState<any>(null);
  const [view, setView] = useState<View>("dash");

  useEffect(() => {
    api.requireStaff(["owner", "frontdesk"]).then((s) => {
      if (!s) return;
      setStaff(s);
      const h = location.hash.slice(1) as View;
      if (NAV.some((n) => n[0] === h)) setView(h);
    });
  }, []);
  const nav = (v: View) => { setView(v); history.replaceState(null, "", "#" + v); window.scrollTo(0, 0); };
  if (!staff) return <div className="st-main mono" style={{ color: "var(--dim)" }}>Loading…</div>;
  const owner = staff.role === "owner";

  return (
    <div className="st">
      <aside className="st-side">
        <div style={{ padding: "0 8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 10, height: 24, background: "var(--red)", transform: "skewX(-18deg)" }} />
          <span className="anton" style={{ fontSize: 22, color: "var(--fg)", letterSpacing: ".06em" }}>DOJO X</span>
          <span className="mono" style={{ font: "600 9px/1 var(--mono)", letterSpacing: ".18em", color: "var(--dim)" }}>STAFF</span>
        </div>
        {NAV.map(([k, l, ic]) => <button key={k} className={"st-nav" + (view === k ? " on" : "")} onClick={() => nav(k)}><Icon d={ic} />{l}</button>)}
        <div style={{ marginTop: "auto", padding: "0 8px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div><div className="st-t">{staff.name}</div><div className="st-s">{staff.role.toUpperCase()}</div></div>
          <a href="/coach-app" style={{ font: "600 13px/1.4 var(--sans)", color: "var(--mid)" }}>Open coach app →</a>
          <a href="/login#logout" style={{ font: "600 13px/1.4 var(--sans)", color: "var(--dim)" }}>Sign out</a>
        </div>
      </aside>
      <main className="st-main" key={view}>
        {view === "dash" && <Dashboard go={nav} />}
        {view === "members" && <Members />}
        {view === "checkin" && <Checkin />}
        {view === "payments" && <Payments owner={owner} />}
        {view === "schedule" && <Schedule owner={owner} />}
        {view === "events" && <Events owner={owner} />}
        {view === "coupons" && <Coupons owner={owner} />}
        {view === "trials" && <Trials />}
      </main>
      <nav className="st-tabs" aria-label="Admin">
        {NAV.map(([k, l, ic]) => <button key={k} className={"st-tab" + (view === k ? " on" : "")} onClick={() => nav(k)}><Icon d={ic} />{l}</button>)}
        <button className="st-tab" onClick={() => go("/login#logout")}><Icon d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />Sign out</button>
      </nav>
    </div>
  );
}

const Head = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="st-h"><h1 className="anton">{title}<span className="red">.</span></h1><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div></div>
);
const Loading = () => <div className="st-empty mono">Loading…</div>;
const ReadOnly = () => <div className="st-card" style={{ padding: "12px 16px", marginBottom: 14, font: "500 13px/1.5 var(--sans)", color: "var(--dim)" }}>View only: schedule, events and coupons can be changed by the owner.</div>;

/* ---------------- Dashboard ---------------- */
function Dashboard({ go }: { go: (v: View) => void }) {
  const { toast } = useShell();
  const stats = useLoad(() => http("GET", "/api/staff/stats"));
  const classes = useLoad(() => http("GET", "/api/staff/classes"));
  const att = useLoad(() => http("GET", `/api/staff/attendance?date=${ymd()}`));
  const bks = useLoad(() => http("GET", `/api/staff/bookings?date=${ymd()}`));
  const trials = useLoad(() => http("GET", "/api/staff/trials"));
  const events = useLoad(() => http("GET", "/api/staff/events"));
  const s = stats.data as any, today = ymd();
  const cancelled = new Set(((classes.data as any)?.cancellations ?? []).filter((c: any) => c.on_date === today).map((c: any) => c.class_id));
  const todays = (((classes.data as any)?.classes ?? []) as any[]).filter((c) => c.active && occursOn(c, today)).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const bookedBy = (id: string) => (((bks.data as any)?.bookings ?? []) as any[]).filter((b) => b.classId === id && b.status === "booked").length;
  const attBy = (id: string) => (((att.data as any)?.attendance ?? []) as any[]).filter((a) => a.class_id === id && a.status !== "absent").length;
  const upcoming = (((events.data as any)?.events ?? []) as any[]).filter((e) => e.next).sort((a, b) => a.next.localeCompare(b.next)).slice(0, 3);
  const setStatus = async (id: string, status: string) => { const r = await api.setTrialStatus(id, status); if (!r.ok) return toast(r.error!); trials.reload(); };

  return (
    <>
      <Head title="Dashboard" />
      <div className="st-kpis">
        {[["COLLECTED TODAY", s ? rupees(s.revenueToday) : undefined], ["COLLECTED THIS MONTH", s ? rupees(s.revenueMonth) : undefined], ["ACTIVE MEMBERS", s?.activeMembers], ["RENEWALS DUE", s?.renewalsDue], ["CHECK-INS TODAY", s?.checkinsToday], ["CLASSES TODAY", s?.classesToday], ["NEW THIS MONTH", s?.newThisMonth], ["TRIALS TO FOLLOW UP", s?.trialsOpen], ["UPCOMING EVENTS", s?.upcomingEvents]].map(([k, v]) => (
          <div className="st-kpi" key={k as string}><small>{k}</small><b>{v ?? "–"}</b></div>
        ))}
      </div>
      <div className="st-grid2">
        <div>
          <div className="st-sec">TODAY · {fmtDay(today).toUpperCase()}</div>
          <div className="st-card">
            {classes.loading ? <Loading /> : !todays.length ? <div className="st-empty">No classes scheduled today.</div> : todays.map((c) => (
              <div className="st-row" key={c.id} style={{ opacity: cancelled.has(c.id) ? 0.5 : 1 }}>
                <span style={{ width: 8, height: 8, background: hueColor(discsOf(c)[0]), flex: "none" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="st-t" style={{ textDecoration: cancelled.has(c.id) ? "line-through" : "none" }}>{c.title}</div>
                  <div className="st-s">{time12(c.start_time)} · {c.duration_min} MIN · {coachNames(c).toUpperCase()}</div>
                </div>
                {cancelled.has(c.id) ? <span className="st-pill">CANCELLED</span> : <span className="st-pill">{bookedBy(c.id)} BOOKED · {attBy(c.id)} IN · CAP {c.capacity}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Renewals go={go} />
          <div>
            <div className="st-sec" style={{ display: "flex", justifyContent: "space-between" }}>RECENT TRIALS <a href="#trials" onClick={(e) => { e.preventDefault(); go("trials"); }} style={{ color: "var(--mid)" }}>ALL →</a></div>
            <div className="st-card">
              {trials.loading ? <Loading /> : !((trials.data as any)?.trials ?? []).length ? <div className="st-empty">No trial bookings yet.</div> :
                ((trials.data as any).trials as any[]).slice(0, 5).map((t) => (
                  <div className="st-row" key={t.id}>
                    <div style={{ flex: 1, minWidth: 0 }}><div className="st-t">{t.name}</div><div className="st-s">{(D.disciplines[t.discipline]?.name ?? t.discipline).toUpperCase()} · {t.slot ? `${t.slot.day} ${t.slot.time}` : fmtDay(t.createdAt.slice(0, 10))}</div></div>
                    <select className="st-in" style={{ width: 130, height: 36, fontSize: 12 }} value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} aria-label="Trial status">
                      {["booked", "attended", "no-show", "joined"].map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <div className="st-sec" style={{ display: "flex", justifyContent: "space-between" }}>NEXT EVENTS <a href="#events" onClick={(e) => { e.preventDefault(); go("events"); }} style={{ color: "var(--mid)" }}>ALL →</a></div>
            <div className="st-card">
              {events.loading ? <Loading /> : !upcoming.length ? <div className="st-empty">No upcoming events.</div> : upcoming.map((e) => (
                <div className="st-row" key={e.id}><div style={{ flex: 1 }}><div className="st-t">{e.title}</div><div className="st-s">{fmtWhen(e.next).toUpperCase()}{e.repeat_days?.length ? " · REPEATS" : ""}</div></div><span className="st-pill">{e.kind.toUpperCase()}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Members ---------------- */
function Members() {
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/members"));
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<any>(null);
  const [pay, setPay] = useState<any[] | null>(null);
  const all = ((data as any)?.members ?? []) as any[];
  const t = q.toLowerCase().replace(/\s/g, "");
  const list = all.filter((m) => !t || (m.name + m.phone + m.memberCode).toLowerCase().replace(/\s/g, "").includes(t));
  const fam = sel ? all.filter((m) => m.accountId === sel.accountId && m.id !== sel.id) : [];
  const age = (d?: string) => (d ? Math.floor((Date.now() - +new Date(d)) / 31557600000) : null);
  return (
    <>
      <Head title="Members" />
      <input className="st-in" placeholder="Search name, phone or member ID" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 14, maxWidth: 480 }} aria-label="Search members" />
      <div className="st-sec">{list.length} MEMBER{list.length === 1 ? "" : "S"}</div>
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">{all.length ? "No members match that search." : "No members yet. They appear here after they sign up."}</div> : list.map((m) => (
          <button className="st-row" key={m.id} onClick={() => setSel(m)}>
            <span className="st-av">{initials(m.name)}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div className="st-t">{m.name}</div><div className="st-s">{m.memberCode} · +91 {m.phone.slice(0, 5)} {m.phone.slice(5)}</div></div>
            <span className="st-pill" style={{ color: PLAN_TONE[m.plan?.status ?? "none"] }}>{planLabel(m.plan)}</span>
            <span className="st-pill" style={{ color: m.waiver ? "oklch(0.78 0.14 150)" : "oklch(0.82 0.14 75)" }}>{m.waiver ? "WAIVER ✓" : "NO WAIVER"}</span>
          </button>
        ))}
      </div>
      {pay && <DeskPayment who={pay} onClose={() => setPay(null)} onSaved={() => { setPay(null); setSel(null); reload(); }} />}
      {sel && !pay && (
        <Sheet title={sel.name} onClose={() => setSel(null)}>
          {[["Member ID", sel.memberCode], ["Plan", sel.plan?.status === "active" || sel.plan?.status === "expiring" ? `${sel.plan.disciplines.map((k: string) => D.disciplines[k]?.name ?? k).join(" + ")} until ${fmtDay(sel.plan.endsOn)} (${sel.plan.daysLeft} days)` : sel.plan?.status === "ended" ? `Ended ${fmtDay(sel.plan.endsOn)}` : "No plan yet"], ["Relation", sel.rel === "You" ? "Account owner" : sel.rel], ["Phone", `+91 ${sel.phone.slice(0, 5)} ${sel.phone.slice(5)}`], ["Date of birth", sel.dob ? `${fmtDay(sel.dob)} ${sel.dob.slice(0, 4)} (${age(sel.dob)} yrs)` : "—"], ["Gender", sel.gender || "—"], ["Email", sel.email || "—"],
            ["Emergency contact", sel.emergency ? `${sel.emergency.name} · ${sel.emergency.phone}` : "—"], ["Waiver", sel.waiver ? `Signed ${sel.waiver.signed} by ${sel.waiver.by} (${sel.waiver.type.toLowerCase()})` : "Not signed"], ["Joined", fmtDay(sel.createdAt.slice(0, 10)) + " " + sel.createdAt.slice(0, 4)]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: "1px solid #212121" }}><span className="st-lb" style={{ margin: 0 }}>{(k as string).toUpperCase()}</span><span style={{ font: "600 14px/1.4 var(--sans)", color: "var(--fg)", textAlign: "right" }}>{v}</span></div>
          ))}
          {fam.length > 0 && <><div className="st-sec" style={{ marginTop: 22 }}>SAME ACCOUNT</div>{fam.map((f) => <button className="st-row" key={f.id} onClick={() => setSel(f)} style={{ padding: "10px 0" }}><span className="st-av">{initials(f.name)}</span><div style={{ flex: 1 }}><div className="st-t">{f.name}</div><div className="st-s">{f.rel.toUpperCase()}</div></div></button>)}</>}
          <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            <button className="st-btn p" onClick={() => setPay([sel])}>Record payment</button>
            <a className="st-btn" href={`https://wa.me/91${sel.phone}`} target="_blank" rel="noopener">WhatsApp</a>
            <a className="st-btn" href={`tel:+91${sel.phone}`}>Call</a>
          </div>
        </Sheet>
      )}
    </>
  );
}

/* ---------------- Check-in ---------------- */
function Checkin() {
  const { toast } = useShell();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[] | null>(null);
  const [classId, setClassId] = useState("");
  const [pay, setPay] = useState<any[] | null>(null);
  const att = useLoad(() => http("GET", `/api/staff/attendance?date=${ymd()}`));
  const classes = useLoad(() => http("GET", "/api/staff/classes"));
  const todays = (((classes.data as any)?.classes ?? []) as any[]).filter((c) => c.active && occursOn(c, ymd())).sort((a, b) => a.start_time.localeCompare(b.start_time));

  useEffect(() => {
    if (!q.trim()) { setHits(null); return; }
    const t = setTimeout(async () => { const r = await http("GET", `/api/staff/members/search?q=${encodeURIComponent(q)}`); setHits(r.ok ? r.members : []); }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const checkIn = async (m: any) => {
    const r = await http("POST", "/api/staff/attendance", { memberId: m.id, classId: classId || null, date: ymd(), status: "present", source: "desk" });
    if (!r.ok) return toast(r.error!);
    toast(`${m.name} checked in`); setQ(""); att.reload();
  };
  const undo = async (id: string) => { await http("DELETE", `/api/staff/attendance?id=${id}`); att.reload(); };
  const log = ((att.data as any)?.attendance ?? []) as any[];

  return (
    <>
      <Head title="Check-in" />
      {pay && <DeskPayment who={pay} onClose={() => setPay(null)} onSaved={() => { setPay(null); setQ(""); toast("Payment recorded. Plan is active."); }} />}
      <div className="st-grid2">
        <div>
          <Field label="CLASS (OPTIONAL)">
            <select className="st-in" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">Open mat / no specific class</option>
              {todays.map((c) => <option key={c.id} value={c.id}>{time12(c.start_time)} · {c.title}</option>)}
            </select>
          </Field>
          <Field label="FIND A MEMBER"><input className="st-in" autoFocus placeholder="Phone, name or member ID" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
          {hits && (
            <div className="st-card">
              {!hits.length ? <div className="st-empty">No member found for “{q}”.</div> : hits.map((m) => {
                const done = log.some((a) => a.member_id === m.id && (a.class_id ?? "") === classId && a.status !== "absent");
                return (
                  <div className="st-row" key={m.id}>
                    <span className="st-av">{initials(m.name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}><div className="st-t">{m.name}</div><div className="st-s">{m.memberCode} · {m.rel.toUpperCase()} · <span style={{ color: PLAN_TONE[m.plan?.status ?? "none"] }}>{planLabel(m.plan)}</span></div></div>
                    {!["active", "expiring"].includes(m.plan?.status) && <button className="st-btn sm p" onClick={() => setPay([m])}>Collect payment</button>}
                    <button className={"st-btn sm" + (done ? "" : ["active", "expiring"].includes(m.plan?.status) ? " p" : "")} disabled={done} onClick={() => checkIn(m)}>{done ? "Checked in ✓" : "Check in"}</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <div className="st-sec">TODAY · {log.filter((a) => a.status !== "absent").length} CHECKED IN</div>
          <div className="st-card">
            {att.loading ? <Loading /> : !log.length ? <div className="st-empty">No check-ins yet today.</div> : log.slice(0, 20).map((a) => (
              <div className="st-row" key={a.id}>
                <div style={{ flex: 1, minWidth: 0 }}><div className="st-t">{a.name}</div><div className="st-s">{new Date(a.created_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()} · {a.source === "desk" ? "FRONT DESK" : "COACH"} · {a.status.toUpperCase()}</div></div>
                <button className="st-btn sm" onClick={() => undo(a.id)} aria-label={`Undo ${a.name}`}>Undo</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- Schedule ---------------- */
const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced"], AGES = ["Kids", "Teens", "Adults", "Teens & Adults"];
const blankClass = (day: number) => ({ day, days: [day], mode: "ongoing", startDate: ymd(), endDate: "", date: nextDateFor(day), startTime: "18:30", durationMin: 60, disciplines: ["mma"], title: "", coaches: ["arjun"], level: "All levels", ageGroup: "Adults", capacity: 20 });

function Schedule({ owner }: { owner: boolean }) {
  const { toast } = useShell();
  const [day, setDay] = useState(wd());
  const [form, setForm] = useState<any>(null);   // class being edited / created
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/classes"));
  const classes = (((data as any)?.classes ?? []) as any[]);
  const cancels = (((data as any)?.cancellations ?? []) as any[]);
  const list = classes.filter((c) => c.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const date = nextDateFor(day);
  const todayStr = ymd();
  const bks = useLoad(() => http("GET", `/api/staff/bookings?date=${date}`), [date]);
  const seats = (id: string) => (((bks.data as any)?.bookings ?? []) as any[]).filter((b) => b.classId === id);
  /** The next date this class actually runs (respecting its start/end dates), or null when it has finished. */
  const nextRun = (c: any): string | null => {
    const a = startOf(c), b = endOf(c), from = a && a > todayStr ? a : todayStr;
    const d = nextDateOnOrAfter(from, c.day);
    return b && d > b ? null : d;
  };
  const isCancelled = (c: any) => { const n = nextRun(c); return !!n && cancels.some((x) => x.class_id === c.id && x.on_date === n); };

  const clearAll = async () => {
    if (!confirm(`Delete all ${classes.length} classes from the weekly schedule? This can't be undone.`)) return;
    const r = await http("DELETE", "/api/staff/classes"); if (!r.ok) return toast(r.error!);
    toast("Schedule cleared"); reload();
  };
  const setupStandard = async () => {
    const replace = classes.filter((c) => discsOf(c).every((d: string) => ["mma", "boxing", "kickboxing", "muaythai"].includes(d))).length;
    if (!confirm(`Set up the standard Mon–Fri evening batches?\n\n7–8 PM Amateur and 8–9 PM Intermediate & Pro, teens and adults together:\nMon Boxing · Tue Kickboxing & Muay Thai · Wed Jiu-Jitsu · Thu MMA Fundamentals · Fri Sparring\n\nThis REPLACES your ${replace} existing boxing / kickboxing / Muay Thai / MMA class${replace === 1 ? "" : "es"} (and their bookings). Karate, gymnastics and yoga are not touched.`)) return;
    const r = await http("POST", "/api/staff/classes/standard"); if (!r.ok) return toast(r.error!);
    toast(`10 classes set up${r.removed ? ` · ${r.removed} replaced` : ""}`); reload();
  };
  const loadSample = async () => { const r = await http("POST", "/api/staff/classes/sample"); if (!r.ok) return toast(r.error!); toast("Sample timetable loaded"); reload(); };

  const toggleCancel = async (c: any) => {
    const n = nextRun(c); if (!n) return;
    const r = await http("POST", `/api/staff/classes/${c.id}/cancel`, { date: n, cancelled: !isCancelled(c) });
    if (!r.ok) return toast(r.error!);
    toast(isCancelled(c) ? "Class restored" : `Cancelled for ${fmtDay(n)}`); reload();
  };

  return (
    <>
      <Head title="Schedule">
        {owner && <button className="st-btn" onClick={setupStandard}>Set up Mon–Fri batches</button>}
        {owner && classes.length > 0 && <button className="st-btn d" onClick={clearAll}>Clear all classes</button>}
        {owner && <button className="st-btn p" onClick={() => setForm(blankClass(day))}>+ Add class</button>}
      </Head>
      {!owner && <ReadOnly />}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 16 }}>
        {DAYS.map((d, i) => <button key={d} className={"st-day" + (day === i ? " on" : "")} onClick={() => setDay(i)} style={i === wd() && day !== i ? { borderColor: "var(--red)" } : undefined}><small>{d.toUpperCase()}</small><b>{classes.filter((c) => c.day === i && c.active).length}</b></button>)}
      </div>
      <div className="st-sec">{DAYS_LONG[day].toUpperCase()} · NEXT {fmtDay(date).toUpperCase()}</div>
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">No classes on {DAYS_LONG[day]}.{owner ? " Use “+ Add class”." : ""}{owner && !classes.length && <div style={{ marginTop: 14 }}><button className="st-btn" onClick={loadSample}>Or load the sample timetable</button></div>}</div> : list.map((c) => {
          const nr = nextRun(c), ended = !nr, off = isCancelled(c) || !c.active || ended;
          const a = startOf(c), b = endOf(c), once = a && b && a === b;
          return (
            <div className="st-row" key={c.id} style={{ opacity: off ? 0.55 : 1, flexWrap: "wrap" }}>
              <span style={{ width: 8, alignSelf: "stretch", background: hueColor(discsOf(c)[0]), flex: "none" }} />
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div className="st-t" style={{ textDecoration: off ? "line-through" : "none" }}>{c.title}</div>
                <div className="st-s">{discNames(c).toUpperCase()} · {time12(c.start_time)} · {c.duration_min} MIN · {coachNames(c).toUpperCase()} · {c.level.toUpperCase()} · {c.age_group.toUpperCase()} · CAP {c.capacity}</div>
              </div>
              {c.active && !off && <span className="st-pill">{seats(c.id).filter((b) => b.status === "booked").length}/{c.capacity} BOOKED{seats(c.id).some((b) => b.status === "waitlist") ? ` · ${seats(c.id).filter((b) => b.status === "waitlist").length} WAITING` : ""}</span>}
              {!c.active && <span className="st-pill">HIDDEN</span>}
              {ended && <span className="st-pill">ENDED</span>}
              {once ? <span className="st-pill">ONE DATE · {fmtDay(a!).toUpperCase()}</span> : <>
                {a && a > todayStr && <span className="st-pill">STARTS {fmtDay(a).toUpperCase()}</span>}
                {b && !ended && <span className="st-pill">ENDS {fmtDay(b).toUpperCase()}</span>}
              </>}
              {isCancelled(c) && <span className="st-pill" style={{ color: "oklch(0.78 0.16 40)" }}>CANCELLED {fmtDay(nr!).toUpperCase()}</span>}
              {owner && <>
                {!ended && <button className="st-btn sm" onClick={() => toggleCancel(c)}>{isCancelled(c) ? "Restore" : "Cancel " + fmtDay(nr!).split(" ")[0]}</button>}
                <button className="st-btn sm" onClick={() => setForm({ id: c.id, day: c.day, mode: startOf(c) && endOf(c) && startOf(c) === endOf(c) ? "once" : endOf(c) ? "until" : "ongoing", startDate: startOf(c) ?? ymd(), endDate: endOf(c) ?? "", date: startOf(c) ?? ymd(), startTime: c.start_time, durationMin: c.duration_min, disciplines: discsOf(c), title: c.title, coaches: coachesOf(c), level: c.level, ageGroup: c.age_group, capacity: c.capacity, active: c.active })}>Edit</button>
              </>}
            </div>
          );
        })}
      </div>
      {form && <ClassSheet form={form} onClose={() => setForm(null)} onSaved={(d?: number) => { setForm(null); if (d !== undefined) setDay(d); reload(); }} />}
    </>
  );
}

function ClassSheet({ form, onClose, onSaved }: { form: any; onClose: () => void; onSaved: (day?: number) => void }) {
  const { toast } = useShell();
  const [f, setF] = useState(form);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));
  const editing = !!f.id, once = f.mode === "once";
  const endIn = (weeks: number) => set("endDate", addDays(f.startDate || ymd(), weeks * 7 - 1));

  const days: number[] = once ? [weekdayOf(f.date || ymd())] : editing ? [f.day] : f.days;
  const summary = (() => {
    const names = [...days].sort((a, c) => a - c).map((i) => DAYS[i]).join(", ");
    if (once) return `One class on ${fmtDay(f.date || ymd())}`;
    if (f.mode === "until" && f.startDate && f.endDate && f.endDate >= f.startDate) {
      const n = days.reduce((t, d) => t + countSessions(d, f.startDate, f.endDate), 0);
      return `${n} class${n === 1 ? "" : "es"}: every ${names} from ${fmtDay(f.startDate)} until ${fmtDay(f.endDate)}`;
    }
    return days.length ? `Every ${names}, ongoing${f.startDate && f.startDate > ymd() ? ` from ${fmtDay(f.startDate)}` : ""}` : "";
  })();

  const save = async () => {
    setErr("");
    if (!editing && !once && !f.days.length) return setErr("Pick at least one day.");
    if (f.mode === "until" && !f.endDate) return setErr("Pick when the repeat ends.");
    const { mode, startDate, endDate, date, days: _d, ...rest } = f;
    const payload: any = { ...rest };
    if (once) { payload.day = weekdayOf(date); payload.startDate = date; payload.endDate = date; }
    else { payload.startDate = startDate || null; payload.endDate = mode === "until" ? endDate : null; }
    if (!editing) payload.days = once ? [payload.day] : f.days;
    setBusy(true);
    const r = editing ? await http("PATCH", `/api/staff/classes/${f.id}`, payload) : await http("POST", "/api/staff/classes", payload);
    setBusy(false);
    if (!r.ok) return setErr(r.error!);
    const n = r.classes?.length ?? 1;
    toast(editing ? "Class updated" : n > 1 ? `${n} classes added` : "Class added"); onSaved(payload.days?.[0] ?? payload.day);
  };
  const del = async () => {
    if (!confirm(`Delete “${f.title}” from the weekly schedule?`)) return;
    const r = await http("DELETE", `/api/staff/classes/${f.id}`); if (!r.ok) return setErr(r.error!);
    toast("Class deleted"); onSaved();
  };
  return (
    <Sheet title={editing ? "Edit class" : "Add class"} onClose={onClose}>
      <Field label="TITLE"><input className="st-in" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Muay Thai Fundamentals" /></Field>
      <Field label="DISCIPLINES (PICK ANY NUMBER)"><Multi value={f.disciplines} options={D.order.map((k: string) => [k, D.disciplines[k].name])} onChange={(v) => set("disciplines", v)} /></Field>
      <Field label="COACHES (PICK ANY NUMBER)"><Multi value={f.coaches} options={D.coachOrder.map((k: string) => [k, coachName(k)])} onChange={(v) => set("coaches", v)} /></Field>

      <div className="st-card" style={{ padding: 14, marginBottom: 16 }}>
        <Field label="REPEAT"><Chips value={f.mode} options={[["ongoing", "Every week, ongoing"], ["until", "Every week until a date"], ["once", "One date only"]]} onChange={(v) => set("mode", v)} /></Field>
        {once ? (
          <Field label="DATE"><input className="st-in" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} /></Field>
        ) : (
          <>
            <Field label={editing ? "DAY" : "DAYS (PICK ONE OR MORE)"}>
              {editing
                ? <Chips value={f.day} options={DAYS.map((d, i) => [i, d])} onChange={(v) => set("day", v)} />
                : <Multi value={f.days.map(String)} options={DAYS.map((d, i) => [String(i), d])} onChange={(v) => set("days", v.map(Number))} />}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: f.mode === "until" ? "1fr 1fr" : "1fr", gap: 12 }}>
              <Field label="STARTS ON"><input className="st-in" type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
              {f.mode === "until" && <Field label="ENDS ON"><input className="st-in" type="date" value={f.endDate} min={f.startDate} onChange={(e) => set("endDate", e.target.value)} /></Field>}
            </div>
            {f.mode === "until" && <div className="st-chips" style={{ marginBottom: 6 }}>{[["4 weeks", 4], ["8 weeks", 8], ["3 months", 13], ["6 months", 26]].map(([l, w]) => <button type="button" key={l as string} className="st-chip" onClick={() => endIn(w as number)}>{l}</button>)}</div>}
          </>
        )}
        {summary && <div className="st-s" style={{ marginTop: 8 }}>{summary}</div>}
        {editing && <div className="st-s" style={{ marginTop: 6 }}>Editing changes this day’s class only.</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="START TIME"><input className="st-in" type="time" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} /></Field>
        <Field label="DURATION (MIN)"><input className="st-in" type="number" min={15} max={240} step={5} value={f.durationMin} onChange={(e) => set("durationMin", +e.target.value)} /></Field>
      </div>
      <Field label="LEVEL"><Chips value={f.level} options={LEVELS.map((l) => [l, l])} onChange={(v) => set("level", v)} /></Field>
      <Field label="AGE GROUP"><Chips value={f.ageGroup} options={AGES.map((l) => [l, l])} onChange={(v) => set("ageGroup", v)} /></Field>
      <Field label="CAPACITY"><input className="st-in" type="number" min={1} max={200} value={f.capacity} onChange={(e) => set("capacity", +e.target.value)} /></Field>
      {editing && <Field label="VISIBILITY"><Chips value={f.active ? "on" : "off"} options={[["on", "Shown on the site"], ["off", "Hidden"]]} onChange={(v) => set("active", v === "on")} /></Field>}
      {err && <p className="st-err" role="alert">{err}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="st-btn p" disabled={busy} onClick={save}>{busy ? "Saving" : editing ? "Save changes" : days.length > 1 ? `Add ${days.length} classes` : "Add class"}</button>
        {editing && <button className="st-btn d" onClick={del}>Delete</button>}
      </div>
    </Sheet>
  );
}

/* ---------------- Events ---------------- */
const KINDS = ["Fight Night", "Grading", "Seminar", "Workshop", "Event"];
function Events({ owner }: { owner: boolean }) {
  const { toast } = useShell();
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/events"));
  const [form, setForm] = useState<any>(null);
  const [past, setPast] = useState(false);
  const all = (((data as any)?.events ?? []) as any[]);
  const list = all.filter((e) => (past ? !e.next : !!e.next)).sort((a, b) => (past ? b.starts_at.localeCompare(a.starts_at) : a.next.localeCompare(b.next)));
  const blank = () => { const d = new Date(Date.now() + 7 * 864e5); d.setHours(18, 0, 0, 0); return { title: "", kind: "Fight Night", startsAt: toLocalInput(d.toISOString()), location: "Dojo X, Sai Complex, Vasundhara", price: 0, capacity: "", description: "", published: true, repeat: false, repeatDays: [], repeatUntil: "" }; };
  const togglePub = async (e: any) => { const r = await http("PATCH", `/api/staff/events/${e.id}`, { published: !e.published }); if (!r.ok) return toast(r.error!); reload(); };
  return (
    <>
      <Head title="Events">{owner && <button className="st-btn p" onClick={() => setForm(blank())}>+ Create event</button>}</Head>
      {!owner && <ReadOnly />}
      <div className="st-seg" style={{ marginBottom: 14 }}><button className={!past ? "on" : ""} onClick={() => setPast(false)}>UPCOMING</button><button className={past ? "on" : ""} onClick={() => setPast(true)}>PAST</button></div>
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">{past ? "No past events." : "No upcoming events."}{owner && !past ? " Create one for fight nights, gradings or seminars." : ""}</div> : list.map((e) => (
          <div className="st-row" key={e.id} style={{ flexWrap: "wrap", opacity: e.published ? 1 : 0.6 }}>
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <div className="st-t">{e.title}</div>
              {e.repeat_days?.length ? <div className="st-s" style={{ color: "var(--mid)" }}>↻ {describeRepeat(e).toUpperCase()}</div> : null}
              <div className="st-s">{e.repeat_days?.length ? "NEXT · " : ""}{fmtWhen(e.next ?? e.starts_at).toUpperCase()}{e.location ? ` · ${e.location.toUpperCase()}` : ""} · {e.price ? `₹${e.price}` : "FREE"}{e.capacity ? ` · ${e.capacity} SPOTS` : ""}</div>
            </div>
            <span className="st-pill">{e.kind.toUpperCase()}</span>
            {!e.published && <span className="st-pill">DRAFT</span>}
            {owner && <>
              <button className="st-btn sm" onClick={() => togglePub(e)}>{e.published ? "Unpublish" : "Publish"}</button>
              <button className="st-btn sm" onClick={() => setForm({ id: e.id, title: e.title, kind: e.kind, startsAt: toLocalInput(e.starts_at), location: e.location ?? "", price: e.price, capacity: e.capacity ?? "", description: e.description ?? "", published: e.published, repeat: !!e.repeat_days?.length, repeatDays: e.repeat_days ?? [], repeatUntil: e.repeat_until ?? "" })}>Edit</button>
            </>}
          </div>
        ))}
      </div>
      {form && <EventSheet form={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload(); }} />}
    </>
  );
}
function EventSheet({ form, onClose, onSaved }: { form: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useShell();
  const [f, setF] = useState(form), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));
  const editing = !!f.id;
  const save = async () => {
    setBusy(true); setErr("");
    const { repeat, repeatDays, repeatUntil, ...rest } = f;
    const payload = { ...rest, startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : "", price: Number(f.price || 0), capacity: f.capacity === "" ? null : Number(f.capacity), repeatDays: repeat ? repeatDays : [], repeatUntil: repeat ? repeatUntil : null };
    const r = editing ? await http("PATCH", `/api/staff/events/${f.id}`, payload) : await http("POST", "/api/staff/events", payload);
    setBusy(false); if (!r.ok) return setErr(r.error!);
    toast(editing ? "Event updated" : "Event created"); onSaved();
  };
  const del = async () => { if (!confirm(`Delete “${f.title}”?`)) return; const r = await http("DELETE", `/api/staff/events/${f.id}`); if (!r.ok) return setErr(r.error!); toast("Event deleted"); onSaved(); };
  return (
    <Sheet title={editing ? "Edit event" : "Create event"} onClose={onClose}>
      <Field label="TITLE"><input className="st-in" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Fight Night 10" /></Field>
      <Field label="TYPE"><Chips value={f.kind} options={KINDS.map((k) => [k, k])} onChange={(v) => set("kind", v)} /></Field>
      <Field label="DATE & TIME"><input className="st-in" type="datetime-local" value={f.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></Field>
      <Field label="REPEAT"><Chips value={f.repeat ? "on" : "off"} options={[["off", "Does not repeat"], ["on", "Repeats weekly"]]} onChange={(v) => set("repeat", v === "on")} /></Field>
      {f.repeat && <RepeatFields f={f} set={set} />}
      <Field label="LOCATION"><input className="st-in" value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="PRICE (₹, 0 = FREE)"><input className="st-in" type="number" min={0} value={f.price} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="SPOTS (OPTIONAL)"><input className="st-in" type="number" min={1} value={f.capacity} onChange={(e) => set("capacity", e.target.value)} /></Field>
      </div>
      <Field label="DESCRIPTION"><textarea className="st-in" value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="What members should know" /></Field>
      <Field label="VISIBILITY"><Chips value={f.published ? "on" : "off"} options={[["on", "Published"], ["off", "Draft"]]} onChange={(v) => set("published", v === "on")} /></Field>
      {err && <p className="st-err" role="alert">{err}</p>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="st-btn p" disabled={busy} onClick={save}>{busy ? "Saving" : editing ? "Save changes" : "Create event"}</button>
        {editing && <button className="st-btn d" onClick={del}>Delete</button>}
      </div>
    </Sheet>
  );
}

function RepeatFields({ f, set }: { f: any; set: (k: string, v: any) => void }) {
  const startMs = f.startsAt ? +new Date(f.startsAt) : NaN;
  const startDay = isNaN(startMs) ? -1 : istWeekday(startMs);
  const days: number[] = f.repeatDays;
  const toggle = (i: number) => set("repeatDays", days.includes(i) ? days.filter((d) => d !== i) : [...days, i]);
  const endIn = (weeks: number) => { const d = new Date(startMs + weeks * 7 * 864e5); set("repeatUntil", d.toISOString().slice(0, 10)); };
  const effective = [...new Set([...days, ...(startDay >= 0 ? [startDay] : [])])];
  const n = !isNaN(startMs) && f.repeatUntil && effective.length ? totalSessions({ starts_at: new Date(f.startsAt).toISOString(), repeat_days: effective, repeat_until: f.repeatUntil }) : 0;
  return (
    <div className="st-card" style={{ padding: 14, marginBottom: 16 }}>
      <Field label="REPEATS ON (PICK ONE OR MORE DAYS)">
        <div className="st-chips">{DAYS.map((d, i) => <button type="button" key={d} className={"st-chip" + (effective.includes(i) ? " on" : "")} onClick={() => i !== startDay && toggle(i)} title={i === startDay ? "The first date’s day is always included" : undefined}>{d}</button>)}</div>
        {startDay >= 0 && <div className="st-s" style={{ marginTop: 8 }}>The first date is a {DAYS_LONG[startDay]}, so {DAYS[startDay]} is always included.</div>}
      </Field>
      <Field label="REPEATS UNTIL">
        <input className="st-in" type="date" value={f.repeatUntil} min={f.startsAt?.slice(0, 10)} onChange={(e) => set("repeatUntil", e.target.value)} />
        <div className="st-chips" style={{ marginTop: 8 }}>{[["4 weeks", 4], ["8 weeks", 8], ["3 months", 13], ["6 months", 26]].map(([l, w]) => <button type="button" key={l as string} className="st-chip" onClick={() => endIn(w as number)}>{l}</button>)}</div>
      </Field>
      <div className="st-s">{n ? `${n} session${n === 1 ? "" : "s"}: every ${effective.length === 7 ? "day" : effective.sort((a, b) => a - b).map((i) => DAYS[i]).join(", ")} until ${f.repeatUntil}` : "Choose when the repeat ends."}</div>
    </div>
  );
}

/* ---------------- Coupons ---------------- */
const SCOPES = ["All plans", "First plan only", "Quarterly+", "6 & 12 month plans"];
function Coupons({ owner }: { owner: boolean }) {
  const { toast } = useShell();
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/coupons"));
  const [open, setOpen] = useState(false);
  const list = (((data as any)?.coupons ?? []) as any[]);
  const today = ymd();
  const status = (c: any) => c.status === "paused" ? "PAUSED" : c.valid_until && c.valid_until < today ? "EXPIRED" : c.cap && c.uses >= c.cap ? "USED UP" : "ACTIVE";
  const toggle = async (c: any) => { const r = await http("PATCH", `/api/staff/coupons/${c.code}`, { status: c.status === "active" ? "paused" : "active" }); if (!r.ok) return toast(r.error!); reload(); };
  const del = async (c: any) => { if (!confirm(`Delete ${c.code}?`)) return; const r = await http("DELETE", `/api/staff/coupons/${c.code}`); if (!r.ok) return toast(r.error!); reload(); };
  return (
    <>
      <Head title="Coupons">{owner && <button className="st-btn p" onClick={() => setOpen(true)}>+ Create coupon</button>}</Head>
      {!owner && <ReadOnly />}
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">No coupons yet.</div> : list.map((c) => {
          const st = status(c);
          return (
            <div className="st-row" key={c.code} style={{ flexWrap: "wrap", opacity: st === "ACTIVE" ? 1 : 0.6 }}>
              <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                <div className="anton" style={{ fontSize: 24, color: "var(--fg)", letterSpacing: ".04em" }}>{c.code}</div>
                <div className="st-s">{c.type === "pct" ? `${c.value}% OFF` : `₹${c.value} OFF`} · {c.scope.toUpperCase()} · {c.cap ? `${c.uses}/${c.cap} USED` : `${c.uses} USED · NO LIMIT`}{c.valid_until ? ` · UNTIL ${c.valid_until}` : ""}</div>
              </div>
              <span className="st-pill" style={{ color: st === "ACTIVE" ? "oklch(0.78 0.14 150)" : undefined }}>{st}</span>
              {owner && <><button className="st-btn sm" onClick={() => toggle(c)}>{c.status === "active" ? "Pause" : "Resume"}</button><button className="st-btn sm d" onClick={() => del(c)}>Delete</button></>}
            </div>
          );
        })}
      </div>
      {open && <CouponSheet onClose={() => setOpen(false)} onSaved={() => { setOpen(false); reload(); }} />}
    </>
  );
}
function CouponSheet({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useShell();
  const [f, setF] = useState<any>({ code: "", type: "pct", value: 10, cap: "", validUntil: "", scope: "All plans" });
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }));
  const save = async () => {
    setBusy(true); setErr("");
    const r = await http("POST", "/api/staff/coupons", { ...f, value: Number(f.value), cap: f.cap === "" ? null : Number(f.cap) });
    setBusy(false); if (!r.ok) return setErr(r.error!);
    toast(`${f.code.toUpperCase()} is live`); onSaved();
  };
  const ex = D.quote(["mma"], "half", 1, null), off = f.type === "pct" ? Math.round((ex.sub * f.value) / 100) : Number(f.value);
  return (
    <Sheet title="New coupon" onClose={onClose}>
      <Field label="CODE"><input className="st-in" value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="e.g. FIGHTNIGHT15" maxLength={16} /></Field>
      <Field label="DISCOUNT TYPE"><Chips value={f.type} options={[["pct", "% off"], ["flat", "₹ off"]]} onChange={(v) => { set("type", v); set("value", v === "pct" ? 10 : 500); }} /></Field>
      <Field label={f.type === "pct" ? "PERCENT OFF" : "RUPEES OFF"}><input className="st-in" type="number" min={1} value={f.value} onChange={(e) => set("value", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="USAGE LIMIT (OPTIONAL)"><input className="st-in" type="number" min={1} value={f.cap} onChange={(e) => set("cap", e.target.value)} /></Field>
        <Field label="VALID UNTIL (OPTIONAL)"><input className="st-in" type="date" value={f.validUntil} onChange={(e) => set("validUntil", e.target.value)} /></Field>
      </div>
      <Field label="APPLIES TO"><Chips value={f.scope} options={SCOPES.map((s) => [s, s])} onChange={(v) => set("scope", v)} /></Field>
      <p className="st-s" style={{ margin: "0 0 16px" }}>{`On a 6-month MMA plan (${D.fmt(ex.sub)} after the member discount), ${f.code || "this code"} takes off ${D.fmt(off)}.`}</p>
      {err && <p className="st-err" role="alert">{err}</p>}
      <button className="st-btn p" disabled={busy} onClick={save}>{busy ? "Saving" : "Create coupon"}</button>
    </Sheet>
  );
}

/* ---------------- Trials ---------------- */
function Trials() {
  const { toast } = useShell();
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/trials"));
  const list = (((data as any)?.trials ?? []) as any[]);
  const set = async (id: string, status: string) => { const r = await api.setTrialStatus(id, status); if (!r.ok) return toast(r.error!); reload(); };
  return (
    <>
      <Head title="Trials" />
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">No trial bookings yet. They appear here when someone books a free class.</div> : list.map((t) => (
          <div className="st-row" key={t.id} style={{ flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <div className="st-t">{t.name}</div>
              <div className="st-s">{(D.disciplines[t.discipline]?.name ?? t.discipline).toUpperCase()} · {t.slot ? `${t.slot.title.toUpperCase()} · ${t.slot.day.toUpperCase()} ${t.slot.time.toUpperCase()}` : "NO SLOT"} · BOOKED {fmtDay(t.createdAt.slice(0, 10)).toUpperCase()}</div>
              <div className="st-s">+91 {t.phone.slice(0, 5)} {t.phone.slice(5)}{t.ageGroup ? ` · ${t.ageGroup.toUpperCase()}` : ""}{t.experience ? ` · ${t.experience.toUpperCase()}` : ""}</div>
            </div>
            <a className="st-btn sm" href={`https://wa.me/91${t.phone}`} target="_blank" rel="noopener">WhatsApp</a>
            <select className="st-in" style={{ width: 130, height: 36, fontSize: 12 }} value={t.status} onChange={(e) => set(t.id, e.target.value)} aria-label="Trial status">
              {["booked", "attended", "no-show", "joined"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
        ))}
      </div>
    </>
  );
}


/* ---------------- Renewals (dashboard) ---------------- */
function Renewals({ go }: { go: (v: View) => void }) {
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/renewals"));
  const [pay, setPay] = useState<any[] | null>(null);
  const list = (((data as any)?.renewals ?? []) as any[]).slice(0, 6);
  return (
    <div>
      <div className="st-sec">RENEWALS DUE</div>
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">No plans expiring in the next 7 days.</div> : list.map((r) => (
          <div className="st-row" key={r.id} style={{ flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 150px", minWidth: 0 }}><div className="st-t">{r.name}</div><div className="st-s" style={{ color: PLAN_TONE[r.status] }}>{planLabel(r)}</div></div>
            <a className="st-btn sm" href={waLink(r.phone, `Hi ${r.name.split(" ")[0]}, your Dojo X plan ${r.status === "ended" ? "ended on" : "ends on"} ${fmtDay(r.endsOn)}. You can renew in the member portal or at the front desk. See you on the mat! 🥊`)} target="_blank" rel="noopener">Remind</a>
            <button className="st-btn sm p" onClick={() => setPay([{ id: r.id, name: r.name, phone: r.phone, memberCode: r.memberCode, plan: r }])}>Renew</button>
          </div>
        ))}
      </div>
      {pay && <DeskPayment who={pay} onClose={() => setPay(null)} onSaved={() => { setPay(null); reload(); }} />}
      <span hidden>{String(!!go)}</span>
    </div>
  );
}

/* ---------------- Payments ---------------- */
function Payments({ owner }: { owner: boolean }) {
  const { data, loading, reload } = useLoad(() => http("GET", "/api/staff/payments"));
  const stats = useLoad(() => http("GET", "/api/staff/stats"));
  const [pay, setPay] = useState<any[] | null>(null);
  const [pick, setPick] = useState(false);
  const [filter, setFilter] = useState<"all" | "paid" | "failed">("all");
  const s = stats.data as any;
  const list = (((data as any)?.payments ?? []) as any[]).filter((p) => filter === "all" || (filter === "paid" ? p.status === "paid" : p.status !== "paid"));
  const TONE: any = { paid: "oklch(0.78 0.14 150)", failed: "oklch(0.78 0.16 40)", refunded: "oklch(0.82 0.14 75)" };
  return (
    <>
      <Head title="Payments"><button className="st-btn p" onClick={() => setPick(true)}>+ Record payment</button></Head>
      <div className="st-kpis">
        <div className="st-kpi"><small>COLLECTED TODAY</small><b>{s ? rupees(s.revenueToday) : "–"}</b></div>
        <div className="st-kpi"><small>COLLECTED THIS MONTH</small><b>{s ? rupees(s.revenueMonth) : "–"}</b></div>
        <div className="st-kpi"><small>ACTIVE MEMBERS</small><b>{s?.activeMembers ?? "–"}</b></div>
      </div>
      <div className="st-seg" style={{ marginBottom: 14 }}>{(["all", "paid", "failed"] as const).map((f) => <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f === "failed" ? "FAILED / REFUNDED" : f.toUpperCase()}</button>)}</div>
      <div className="st-card">
        {loading ? <Loading /> : !list.length ? <div className="st-empty">No payments yet. Online payments and desk payments both appear here.</div> : list.map((p) => (
          <div className="st-row" key={p.id} style={{ flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <div className="st-t">{p.names.join(" + ")}</div>
              <div className="st-s">{D.plans[p.duration]?.l.toUpperCase()} · {p.disciplines.map((k: string) => (D.disciplines[k]?.name ?? k).toUpperCase()).join(" + ")}{p.coupon_code ? ` · ${p.coupon_code}` : ""}</div>
              <div className="st-s">{p.invoice_no || "NO INVOICE"} · {fmtWhen(p.paid_at || p.created_at).toUpperCase()} · {p.source === "desk" ? "FRONT DESK" : "ONLINE"}{p.method ? ` · ${p.method.toUpperCase()}` : ""}</div>
              {p.failure_reason && p.status !== "paid" && <div className="st-s" style={{ color: TONE.failed }}>{p.failure_reason}</div>}
            </div>
            <span className="anton" style={{ fontSize: 24, color: "var(--fg)" }}>{rupees(p.amount)}</span>
            <span className="st-pill" style={{ color: TONE[p.status] }}>{p.status.toUpperCase()}</span>
            {p.status === "paid" && <a className="st-btn sm" href={`/invoice?o=${p.id}`} target="_blank" rel="noopener">Invoice</a>}
          </div>
        ))}
      </div>
      <span hidden>{String(owner)}</span>
      {pick && <PickMember onClose={() => setPick(false)} onPick={(m) => { setPick(false); setPay([m]); }} />}
      {pay && <DeskPayment who={pay} onClose={() => setPay(null)} onSaved={() => { setPay(null); reload(); stats.reload(); }} />}
    </>
  );
}

function PickMember({ onClose, onPick }: { onClose: () => void; onPick: (m: any) => void }) {
  const [q, setQ] = useState(""), [hits, setHits] = useState<any[] | null>(null);
  useEffect(() => {
    if (!q.trim()) { setHits(null); return; }
    const t = setTimeout(async () => { const r = await http("GET", `/api/staff/members/search?q=${encodeURIComponent(q)}`); setHits(r.ok ? r.members : []); }, 220);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <Sheet title="Who is paying?" onClose={onClose}>
      <Field label="FIND A MEMBER"><input className="st-in" autoFocus placeholder="Phone, name or member ID" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
      {hits && <div className="st-card">{!hits.length ? <div className="st-empty">No member found.</div> : hits.map((m) => (
        <button className="st-row" key={m.id} onClick={() => onPick(m)}><span className="st-av">{initials(m.name)}</span><div style={{ flex: 1, minWidth: 0 }}><div className="st-t">{m.name}</div><div className="st-s">{m.memberCode} · <span style={{ color: PLAN_TONE[m.plan?.status ?? "none"] }}>{planLabel(m.plan)}</span></div></div></button>
      ))}</div>}
    </Sheet>
  );
}

/** Take a payment at the front desk. The plan becomes active the moment it's saved. */
function DeskPayment({ who, onClose, onSaved }: { who: any[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useShell();
  const [people, setPeople] = useState<any[]>(who);
  const [disc, setDisc] = useState<string[]>(who[0]?.plan?.disciplines?.length ? who[0].plan.disciplines : ["mma"]);
  const [dur, setDur] = useState(who[0]?.plan?.duration && who[0].plan.duration !== "monthly" ? who[0].plan.duration : "monthly");
  const [coupon, setCoupon] = useState(""), [method, setMethod] = useState("cash"), [amount, setAmount] = useState("");
  const [q, setQ] = useState<any>(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const [add, setAdd] = useState(""), [hits, setHits] = useState<any[] | null>(null);
  const [owner, setOwner] = useState(false);
  useEffect(() => { api.staffMe().then((r) => setOwner(r.ok && r.staff.role === "owner")); }, []);

  useEffect(() => {
    if (!disc.length) { setQ(null); return; }
    const t = setTimeout(async () => { const r = await http("POST", "/api/staff/quote", { disciplines: disc, duration: dur, people: people.length, couponCode: coupon }); setQ(r.ok ? r : null); }, 250);
    return () => clearTimeout(t);
  }, [disc, dur, people.length, coupon]);
  useEffect(() => {
    if (!add.trim()) { setHits(null); return; }
    const t = setTimeout(async () => { const r = await http("GET", `/api/staff/members/search?q=${encodeURIComponent(add)}`); setHits(r.ok ? r.members.filter((m: any) => !people.some((p) => p.id === m.id)) : []); }, 220);
    return () => clearTimeout(t);
  }, [add, people]);

  const onlyYoga = disc.length > 0 && disc.every((k) => k === "yoga");
  const save = async () => {
    setBusy(true); setErr("");
    const r = await http("POST", "/api/staff/payments", { memberIds: people.map((p) => p.id), disciplines: disc, duration: onlyYoga ? "monthly" : dur, couponCode: coupon, method, amount: amount === "" ? undefined : Number(amount) });
    setBusy(false); if (!r.ok) return setErr(r.error!);
    toast(`${rupees(r.order.amount)} recorded · ${r.order.invoice_no}`); onSaved();
  };
  return (
    <Sheet title="Record payment" onClose={onClose}>
      <Field label="PAYING FOR">
        <div className="st-chips">{people.map((p) => <span key={p.id} className="st-chip on" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{p.name}{people.length > 1 && <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setPeople(people.filter((x) => x.id !== p.id))} style={{ background: "none", border: 0, color: "inherit", cursor: "pointer" }}>✕</button>}</span>)}</div>
        <input className="st-in" style={{ marginTop: 8 }} placeholder="Add another member (10% off for two)" value={add} onChange={(e) => setAdd(e.target.value)} />
        {hits && hits.length > 0 && <div className="st-card" style={{ marginTop: 6 }}>{hits.slice(0, 5).map((m) => <button className="st-row" key={m.id} onClick={() => { setPeople([...people, m]); setAdd(""); }}><div className="st-t">{m.name}</div><div className="st-s">{m.memberCode}</div></button>)}</div>}
      </Field>
      <Field label="DISCIPLINES"><Multi value={disc} options={D.order.map((k: string) => [k, D.disciplines[k].name])} onChange={setDisc} /></Field>
      {!onlyYoga && <Field label="PLAN LENGTH"><Chips value={dur} options={D.planOrder.map((k: string) => [k, D.plans[k].l])} onChange={setDur} /></Field>}
      {onlyYoga && <p className="st-s" style={{ margin: "0 0 16px" }}>Yoga is monthly only.</p>}
      <Field label="COUPON (OPTIONAL)"><input className="st-in" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="e.g. DOJOX10" /></Field>
      {q?.couponError && <p className="st-err">{q.couponError}</p>}
      <Field label="PAID BY"><Chips value={method} options={[["cash", "Cash"], ["upi", "UPI"], ["card", "Card"]]} onChange={setMethod} /></Field>
      <div className="st-card" style={{ padding: 14, marginBottom: 16 }}>
        {q ? <>
          <div style={{ display: "flex", justifyContent: "space-between" }} className="st-s"><span>Subtotal</span><span>{rupees(q.gross)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }} className="st-s"><span>{people.length > 1 ? "10%" : "5%"} member discount</span><span>−{rupees(q.discountPeople)}</span></div>
          {q.discountCoupon > 0 && <div style={{ display: "flex", justifyContent: "space-between" }} className="st-s"><span>Coupon</span><span>−{rupees(q.discountCoupon)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}><span className="st-lb" style={{ margin: 0 }}>TO COLLECT</span><span className="anton" style={{ fontSize: 34, color: "var(--fg)" }}>{rupees(q.amount)}</span></div>
        </> : <div className="st-s">Pick at least one discipline.</div>}
      </div>
      {owner && <Field label="AMOUNT RECEIVED, IF DIFFERENT (OWNER ONLY)"><input className="st-in" type="number" min={1} value={amount} placeholder={q ? String(q.amount) : ""} onChange={(e) => setAmount(e.target.value)} /></Field>}
      {err && <p className="st-err" role="alert">{err}</p>}
      <button className="st-btn p" disabled={busy || !q || !people.length} onClick={save}>{busy ? "Saving" : `Record ${q ? rupees(Number(amount) || q.amount) : ""} received`}</button>
    </Sheet>
  );
}

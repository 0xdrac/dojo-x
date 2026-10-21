"use client";
import { useEffect, useState } from "react";
import { useShell } from "@/components/Shell";
import { occursOn } from "@/lib/classes";
import { D, api, coachName, coachesOf, discNames, discsOf, fmtDay, hueColor, http, initials, time12, useLoad, ymd } from "./ui";

type Status = "present" | "late" | "absent";

export default function CoachApp() {
  const [staff, setStaff] = useState<any>(null);
  const [coach, setCoach] = useState("");
  const [date, setDate] = useState(ymd());
  const [open, setOpen] = useState<any>(null);   // class being registered

  useEffect(() => {
    api.requireStaff().then((s) => { if (s) { setStaff(s); setCoach(s.coachKey || (s.role === "owner" ? "aman" : "")); } });
  }, []);
  const classes = useLoad(() => http("GET", "/api/staff/classes"), [staff?.id]);
  const bk = useLoad(() => http("GET", `/api/staff/bookings?date=${date}`), [date, staff?.id]);
  const att = useLoad(() => http("GET", `/api/staff/attendance?date=${date}`), [date, staff?.id]);

  if (!staff) return <div className="st-main mono" style={{ color: "var(--dim)" }}>Loading…</div>;
  const cancelled = new Set((((classes.data as any)?.cancellations ?? []) as any[]).filter((c) => c.on_date === date).map((c) => c.class_id));
  const mine = (((classes.data as any)?.classes ?? []) as any[]).filter((c) => c.active && occursOn(c, date) && (!coach || coachesOf(c).includes(coach))).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const rows = (((att.data as any)?.attendance ?? []) as any[]);
  const count = (id: string, st?: Status) => rows.filter((a) => a.class_id === id && (st ? a.status === st : a.status !== "absent")).length;
  const booked = (id: string) => (((bk.data as any)?.bookings ?? []) as any[]).filter((b) => b.classId === id && b.status === "booked").length;
  const isToday = date === ymd();

  return (
    <div style={{ minHeight: "100vh", maxWidth: 760, margin: "0 auto", padding: "20px 16px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <span style={{ width: 10, height: 24, background: "var(--red)", transform: "skewX(-18deg)" }} />
        <span className="anton" style={{ fontSize: 22, color: "var(--fg)", letterSpacing: ".06em" }}>DOJO X</span>
        <span className="mono" style={{ font: "600 10px/1 var(--mono)", letterSpacing: ".18em", color: "var(--dim)" }}>COACH</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "center" }}>
          {staff.role === "owner" && <a href="/admin" style={{ font: "600 13px/1 var(--sans)", color: "var(--mid)" }}>Admin</a>}
          <a href="/login#logout" style={{ font: "600 13px/1 var(--sans)", color: "var(--dim)" }}>Sign out</a>
        </span>
      </header>

      {open ? (
        <Register cls={open} date={date} coach={coach} onBack={() => { setOpen(null); att.reload(); }} />
      ) : (
        <>
          <div className="st-h" style={{ marginBottom: 14 }}>
            <h1 className="anton">{isToday ? "Today" : fmtDay(date)}<span className="red">.</span></h1>
            <input className="st-in" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} style={{ width: 170 }} aria-label="Date" />
          </div>
          {(staff.role === "owner" || !staff.coachKey) && (
            <div style={{ marginBottom: 16 }}>
              <div className="st-lb">COACH</div>
              <div className="st-chips">{D.coachOrder.map((k: string) => <button key={k} className={"st-chip" + (coach === k ? " on" : "")} onClick={() => setCoach(k)}>{coachName(k)}</button>)}</div>
            </div>
          )}
          <div className="st-sec">{coachName(coach).toUpperCase()} · {mine.filter((c) => !cancelled.has(c.id)).length} CLASS{mine.length === 1 ? "" : "ES"}</div>
          <div className="st-card">
            {classes.loading ? <div className="st-empty mono">Loading…</div> : !mine.length ? <div className="st-empty">No classes for {coachName(coach)} on {fmtDay(date)}.</div> : mine.map((c) => {
              const off = cancelled.has(c.id);
              return (
                <button className="st-row" key={c.id} disabled={off} onClick={() => setOpen(c)} style={{ opacity: off ? 0.5 : 1 }}>
                  <span style={{ width: 8, alignSelf: "stretch", background: hueColor(discsOf(c)[0]), flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ font: "700 12px/1 var(--mono)", letterSpacing: ".1em", color: "var(--dim)" }}>{time12(c.start_time).toUpperCase()} · {c.duration_min} MIN</div>
                    <div className="st-t" style={{ marginTop: 6, textDecoration: off ? "line-through" : "none" }}>{c.title}</div>
                    <div className="st-s">{discNames(c).toUpperCase()} · {c.level.toUpperCase()} · {c.age_group.toUpperCase()}</div>
                  </div>
                  {off ? <span className="st-pill">CANCELLED</span> : <span className="st-pill">{booked(c.id)} BOOKED · {count(c.id)} IN →</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Register({ cls, date, coach, onBack }: { cls: any; date: string; coach: string; onBack: () => void }) {
  const { toast } = useShell();
  const att = useLoad(() => http("GET", `/api/staff/attendance?date=${date}&classId=${cls.id}`), [cls.id, date]);
  const sess = useLoad(() => http("GET", `/api/staff/sessions?classId=${cls.id}&date=${date}`), [cls.id, date]);
  const [note, setNote] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<any[] | null>(null);
  const rows = (((att.data as any)?.roster ?? []) as any[]);
  const session = (sess.data as any)?.session;
  const submitted = !!session?.submitted_at;
  const noteVal = note ?? session?.note ?? "";

  useEffect(() => {
    if (!q.trim()) { setHits(null); return; }
    const t = setTimeout(async () => { const r = await http("GET", `/api/staff/members/search?q=${encodeURIComponent(q)}`); setHits(r.ok ? r.members : []); }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const mark = async (memberId: string, status: Status) => {
    const r = await http("POST", "/api/staff/attendance", { memberId, classId: cls.id, date, status });
    if (!r.ok) return toast(r.error!); att.reload();
  };
  const add = async (m: any) => { await mark(m.id, "present"); toast(`${m.name} added`); setQ(""); };
  const remove = async (id: string) => { await http("DELETE", `/api/staff/attendance?id=${id}`); att.reload(); };
  const markAll = async () => { for (const r of rows.filter((x) => !x.status)) await http("POST", "/api/staff/attendance", { memberId: r.memberId, classId: cls.id, date, status: "present" }); att.reload(); toast("Everyone booked marked present"); };
  const unmarked = rows.filter((r) => !r.status).length, booked = rows.filter((r) => r.booked && !r.waitlist).length;
  const submit = async () => {
    const r = await http("PUT", "/api/staff/sessions", { classId: cls.id, date, note: noteVal, submit: true });
    if (!r.ok) return toast(r.error!);
    toast("Attendance submitted"); sess.reload();
  };
  const saveNote = async () => { const r = await http("PUT", "/api/staff/sessions", { classId: cls.id, date, note: noteVal }); if (r.ok) toast("Note saved"); };

  const present = rows.filter((r) => r.status === "present").length, late = rows.filter((r) => r.status === "late").length, absent = rows.filter((r) => r.status === "absent").length;
  return (
    <>
      <button className="st-btn sm" onClick={onBack} style={{ marginBottom: 16 }}>← All classes</button>
      <div className="mono" style={{ font: "700 12px/1 var(--mono)", letterSpacing: ".14em", color: "var(--dim)" }}>{discNames(cls).toUpperCase()} · {time12(cls.start_time).toUpperCase()} – {fmtDay(date).toUpperCase()}</div>
      <h1 className="anton" style={{ margin: "10px 0 14px", fontSize: "clamp(34px,6vw,52px)", lineHeight: 0.95, color: "var(--fg)" }}>{cls.title}</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <span className="st-pill">{booked} BOOKED</span><span className="st-pill">{present} PRESENT</span><span className="st-pill">{late} LATE</span><span className="st-pill">{absent} ABSENT</span><span className="st-pill">CAP {cls.capacity}</span>
        {submitted && <span className="st-pill" style={{ color: "oklch(0.78 0.14 150)" }}>SUBMITTED ✓</span>}
      </div>

      <div className="st-sec">ADD A MEMBER</div>
      <input className="st-in" placeholder="Search name, phone or member ID" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Add member to this class" />
      {hits && (
        <div className="st-card" style={{ marginTop: 8 }}>
          {!hits.length ? <div className="st-empty">No member found.</div> : hits.map((m) => (
            <div className="st-row" key={m.id}><span className="st-av">{initials(m.name)}</span><div style={{ flex: 1, minWidth: 0 }}><div className="st-t">{m.name}</div><div className="st-s">{m.memberCode}</div></div><button className="st-btn sm p" onClick={() => add(m)}>Add</button></div>
          ))}
        </div>
      )}

      <div className="st-sec" style={{ marginTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>REGISTER · {rows.length}{unmarked > 0 && <button className="st-btn sm" onClick={markAll}>Mark {unmarked} unmarked present</button>}</div>
      <div className="st-card">
        {att.loading ? <div className="st-empty mono">Loading…</div> : !rows.length ? <div className="st-empty">Nobody has booked yet. Search above to add members as they arrive.</div> : rows.map((r) => (
          <div className="st-row" key={r.memberId} style={{ flexWrap: "wrap" }}>
            <span className="st-av">{initials(r.name)}</span>
            <div style={{ flex: "1 1 140px", minWidth: 0 }}><div className="st-t">{r.name}</div><div className="st-s">{r.memberCode}{r.waitlist ? " · WAITLIST" : r.booked ? " · BOOKED" : " · WALK-IN"}</div></div>
            <div className="st-att">{(["present", "late", "absent"] as Status[]).map((s) => <button key={s} className={(r.status === s ? "on " : "") + s} onClick={() => mark(r.memberId, s)}>{s.toUpperCase()}</button>)}</div>
            {r.attendanceId && !r.booked && <button className="st-btn sm" onClick={() => remove(r.attendanceId)} aria-label={`Remove ${r.name}`}>✕</button>}
          </div>
        ))}
      </div>

      <div className="st-sec" style={{ marginTop: 22 }}>CLASS NOTE</div>
      <textarea className="st-in" value={noteVal} onChange={(e) => setNote(e.target.value)} onBlur={saveNote} placeholder="Injuries, drills covered, anything the next coach should know" />
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button className="st-btn p" onClick={submit}>{submitted ? "Update & resubmit" : "Submit attendance"}</button>
        <button className="st-btn" onClick={onBack}>Done</button>
      </div>
      <p className="st-s" style={{ marginTop: 10 }}>{submitted ? `Submitted ${new Date(session.submitted_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}. You can still edit and resubmit.` : `Coach: ${coachName(coach)}`}</p>
    </>
  );
}

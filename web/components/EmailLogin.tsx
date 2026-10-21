"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DojoAPI } from "@/lib/api";
import { completeEmailLink, isEmailLink, rememberedEmail, sendEmailLink } from "@/lib/firebase";

const Login = dynamic(() => import("@/screens/Login"), { ssr: false });
const C = { bg: "#0D0D0D", card: "#141414", line: "#262626", fg: "#F5F5F5", mid: "#C9C9C9", dim: "#9A9A9A", red: "#C8102E", err: "oklch(0.78 0.16 40)" };

/**
 * Real sign-in: the member types their email, we send a link, they tap it. Staff use the same page; their email decides where they land.
 * Once signed in (or when finishing onboarding) this hands over to the regular Login screen.
 */
export default function EmailLogin() {
  const [mode, setMode] = useState<"boot" | "form" | "sent" | "confirm" | "working" | "app">("boot");
  const [email, setEmail] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);

  const finish = async (idToken: string) => {
    const r = await DojoAPI.verifyToken(idToken);
    if (!r.ok) { setErr(r.error || "Sign-in failed. Please request a new link."); setMode("form"); history.replaceState(null, "", "/login"); return; }
    history.replaceState(null, "", "/login");
    if (r.staff) return void (location.href = r.staff.role === "coach" ? "/coach-app" : "/admin");
    if (r.onboarded) { let n: string | null = null; try { n = sessionStorage.getItem("dx-next"); sessionStorage.removeItem("dx-next"); } catch {} return void (location.href = n && n.startsWith("/") && !n.startsWith("//") ? n : "/member-portal"); }
    location.href = "/login#onboard";
  };
  const complete = async (addr: string) => {
    setMode("working"); setErr("");
    const c = await completeEmailLink(addr);
    if (!c.ok) { setErr(c.error || "That link didn’t work."); setMode("form"); history.replaceState(null, "", "/login"); return; }
    await finish(c.idToken!);
  };

  useEffect(() => {
    (async () => {
      const h = location.hash.slice(1);
      if (h === "logout") { await DojoAPI.logout(); history.replaceState(null, "", "/login"); return setMode("form"); }
      if (await isEmailLink()) { const saved = rememberedEmail(); return saved ? complete(saved) : setMode("confirm"); }
      if (h === "onboard" || h === "family") return setMode("app");
      const me = await DojoAPI.me(); if (me.ok) return setMode("app");
      const st = await DojoAPI.staffMe(); if (st.ok) { location.href = st.staff.role === "coach" ? "/coach-app" : "/admin"; return; }
      setMode("form");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid = /^\S+@\S+\.\S+$/.test(email.trim());
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); if (!valid) return setErr("Enter a valid email address.");
    setBusy(true); setErr("");
    const r = await sendEmailLink(email.trim().toLowerCase()); setBusy(false);
    if (!r.ok) return setErr(r.error || "Couldn’t send the link."); setMode("sent");
  };
  const confirm = (e: React.FormEvent) => { e.preventDefault(); if (!valid) return setErr("Enter the email address you used."); complete(email.trim().toLowerCase()); };

  if (mode === "app") return <Login />;
  const box = { width: "100%", padding: "16px 14px", background: C.card, border: `1px solid ${err ? C.err : "#2E2E2E"}`, color: C.fg, font: "500 16px/1 Manrope,sans-serif", outline: "none" } as const;
  const btn = { width: "100%", marginTop: 14, padding: 18, background: C.red, border: 0, color: C.fg, font: "800 14px/1 Manrope,sans-serif", letterSpacing: ".1em", cursor: "pointer", opacity: busy ? 0.6 : 1 } as const;
  const kicker = (t: string) => <div style={{ font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: C.dim }}>{t}</div>;
  const h1 = (a: string, b: string) => <h1 style={{ fontFamily: "Anton,Impact,sans-serif", fontWeight: 400, fontSize: 52, lineHeight: 1, margin: "12px 0 10px", textTransform: "uppercase" }}>{a}<span style={{ color: C.red }}>{b}</span></h1>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "Manrope,sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "22px clamp(16px,4vw,48px)" }}><a href="/" style={{ fontFamily: "Anton,Impact,sans-serif", fontSize: 28, letterSpacing: ".04em", color: C.fg }}>DOJO<span style={{ color: C.red }}>X</span></a></header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {mode === "boot" || mode === "working" ? <p style={{ color: C.dim }}>{mode === "working" ? "Signing you in…" : "Loading…"}</p> : null}
          {mode === "form" && (
            <form onSubmit={send}>
              {kicker("MEMBER LOGIN")}{h1("Welcome back", ".")}
              <p style={{ color: C.mid, lineHeight: 1.6, margin: "0 0 22px" }}>Enter your email. We’ll send you a link, and tapping it signs you in. No password needed.</p>
              <label style={{ display: "block", font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: C.dim, marginBottom: 8 }}>EMAIL</label>
              <input type="email" inputMode="email" autoComplete="email" autoFocus value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="you@gmail.com" style={box} />
              {err && <div role="alert" style={{ color: C.err, marginTop: 10, font: "600 13px/1.4 Manrope,sans-serif" }}>{err}</div>}
              <button type="submit" disabled={busy} style={btn}>{busy ? "SENDING LINK" : "EMAIL ME A LINK →"}</button>
              <a href="/free-trial" style={{ display: "block", marginTop: 22, padding: 16, border: `1px solid ${C.line}`, color: C.fg, font: "600 14px/1 Manrope,sans-serif" }}>New to Dojo X? Book a free trial →</a>
            </form>
          )}
          {mode === "sent" && (
            <div>
              {kicker("CHECK YOUR INBOX")}{h1("Link sent", ".")}
              <p style={{ color: C.mid, lineHeight: 1.6 }}>We emailed a sign-in link to <b style={{ color: C.fg }}>{email.trim().toLowerCase()}</b>. Open it on this phone or computer and you’re in. It can take a minute, and it may land in Spam or Promotions.</p>
              <button onClick={() => { setMode("form"); setErr(""); }} style={{ ...btn, background: "transparent", border: "1px solid #2E2E2E" }}>USE A DIFFERENT EMAIL</button>
              <button onClick={send as any} disabled={busy} style={{ ...btn, marginTop: 10, background: "transparent", border: "1px solid #2E2E2E" }}>{busy ? "SENDING…" : "RESEND THE LINK"}</button>
              {err && <div role="alert" style={{ color: C.err, marginTop: 10 }}>{err}</div>}
            </div>
          )}
          {mode === "confirm" && (
            <form onSubmit={confirm}>
              {kicker("ONE MORE STEP")}{h1("Confirm it’s you", ".")}
              <p style={{ color: C.mid, lineHeight: 1.6, margin: "0 0 22px" }}>You opened the link on a different device. Type the email address it was sent to.</p>
              <input type="email" inputMode="email" autoFocus value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="you@gmail.com" style={box} />
              {err && <div role="alert" style={{ color: C.err, marginTop: 10 }}>{err}</div>}
              <button type="submit" style={btn}>SIGN IN →</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

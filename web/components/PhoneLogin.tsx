"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { DojoAPI } from "@/lib/api";

const Login = dynamic(() => import("@/screens/Login"), { ssr: false });
const C = { bg: "#0D0D0D", card: "#141414", line: "#262626", fg: "#F5F5F5", mid: "#C9C9C9", dim: "#9A9A9A", red: "#C8102E", err: "oklch(0.78 0.16 40)" };
type Mode = "boot" | "phone" | "pin" | "otp" | "newpin" | "app";

/**
 * Sign-in with mobile number + 6-digit PIN. A first-time or forgotten PIN is set after a 6-digit code sent on WhatsApp.
 * Staff numbers use the same screen and land on Admin / Coach. Onboarding (profile, waiver, family) is the regular Login screen.
 */
export default function PhoneLogin() {
  const [mode, setMode] = useState<Mode>("boot");
  const [phone, setPhone] = useState(""), [pin, setPin] = useState(""), [pin2, setPin2] = useState(""), [code, setCode] = useState("");
  const [token, setToken] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [wait, setWait] = useState(0), [dev, setDev] = useState("");
  const first = useRef<HTMLInputElement>(null);

  const digits = phone.replace(/\D/g, "");
  useEffect(() => {
    const boot = async () => {
      const h = location.hash.slice(1);
      if (h === "logout") { await DojoAPI.logout(); history.replaceState(null, "", "/login"); return setMode("phone"); }
      if (h === "onboard" || h === "family") return setMode("app");
      const me = await DojoAPI.me(); if (me.ok) { if (!me.onboarded) history.replaceState(null, "", "/login#onboard"); return setMode("app"); }
      const st = await DojoAPI.staffMe(); if (st.ok) { location.href = st.staff.role === "coach" ? "/coach-app" : "/admin"; return; }
      setMode("phone");
    };
    boot();
    const onHash = () => { if (location.hash === "#logout") boot(); };
    window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => { first.current?.focus(); }, [mode]);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(t); }, [wait]);

  const go = (r: any) => {
    if (r.staff) return void (location.href = r.staff.role === "coach" ? "/coach-app" : "/admin");
    if (r.onboarded) { let n: string | null = null; try { n = sessionStorage.getItem("dx-next"); sessionStorage.removeItem("dx-next"); } catch {} return void (location.href = n && n.startsWith("/") && !n.startsWith("//") ? n : "/member-portal"); }
    history.replaceState(null, "", "/login#onboard"); setMode("app");
  };
  const fail = (m?: string) => { setErr(m || "Something went wrong. Try again."); setBusy(false); };
  const fmt = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 10); return d.length > 5 ? d.slice(0, 5) + " " + d.slice(5) : d; };
  const only6 = (v: string) => v.replace(/\D/g, "").slice(0, 6);

  const sendCode = async () => {
    setBusy(true); setErr("");
    const r = await DojoAPI.pinSend(digits); if (!r.ok) return fail(r.error);
    setBusy(false); setDev(r.devCode || ""); setCode(""); setWait(30); setMode("otp");
  };
  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(digits)) return setErr("Enter your 10-digit mobile number.");
    setBusy(true); setErr("");
    const r = await DojoAPI.pinStatus(digits); if (!r.ok) return fail(r.error);
    if (r.hasPin) { setBusy(false); setPin(""); setMode("pin"); } else await sendCode();
  };
  const login = async (p = pin) => {
    if (p.length !== 6 || busy) return;
    setBusy(true); setErr("");
    const r = await DojoAPI.pinLogin(digits, p); if (!r.ok) { setPin(""); return fail(r.error); }
    go(r);
  };
  const check = async (c = code) => {
    if (c.length !== 6 || busy) return;
    setBusy(true); setErr("");
    const r = await DojoAPI.pinCheck(digits, c); if (!r.ok) { setCode(""); return fail(r.error); }
    setBusy(false); setToken(r.setupToken); setPin(""); setPin2(""); setMode("newpin");
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return setErr("Your PIN must be 6 digits.");
    if (pin !== pin2) return setErr("The two PINs don’t match.");
    setBusy(true); setErr("");
    const r = await DojoAPI.pinSet(token, pin); if (!r.ok) return fail(r.error);
    go(r);
  };

  if (mode === "app") return <Login />;
  const field = { width: "100%", padding: "16px 14px", background: C.card, border: `1px solid ${err ? C.err : "#2E2E2E"}`, color: C.fg, font: "500 18px/1 'JetBrains Mono',monospace", outline: "none" } as const;
  const pinField = { ...field, textAlign: "center", letterSpacing: ".6em", fontSize: 26 } as const;
  const btn = { width: "100%", marginTop: 14, padding: 18, background: C.red, border: 0, color: C.fg, font: "800 14px/1 Manrope,sans-serif", letterSpacing: ".1em", cursor: "pointer", opacity: busy ? 0.6 : 1 } as const;
  const ghost = { background: "none", border: 0, color: C.mid, textDecoration: "underline", font: "600 14px/1 Manrope,sans-serif", cursor: "pointer", padding: 0 } as const;
  const kicker = (t: string) => <div style={{ font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: C.dim }}>{t}</div>;
  const h1 = (a: string) => <h1 style={{ fontFamily: "Anton,Impact,sans-serif", fontWeight: 400, fontSize: 52, lineHeight: 1, margin: "12px 0 10px", textTransform: "uppercase" }}>{a}<span style={{ color: C.red }}>.</span></h1>;
  const lbl = (t: string) => <label style={{ display: "block", font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: C.dim, margin: "18px 0 8px" }}>{t}</label>;
  const errBox = err && <div role="alert" style={{ color: C.err, marginTop: 10, font: "600 13px/1.4 Manrope,sans-serif" }}>{err}</div>;
  const back = (to: Mode) => <button type="button" onClick={() => { setMode(to); setErr(""); }} style={{ ...ghost, marginTop: 22, display: "block" }}>← Use a different number</button>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "Manrope,sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "22px clamp(16px,4vw,48px)" }}><a href="/" style={{ fontFamily: "Anton,Impact,sans-serif", fontSize: 28, letterSpacing: ".04em", color: C.fg }}>DOJO<span style={{ color: C.red }}>X</span></a></header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {mode === "boot" && <p style={{ color: C.dim }}>Loading…</p>}

          {mode === "phone" && (
            <form onSubmit={next}>
              {kicker("MEMBER LOGIN")}{h1("Welcome back")}
              <p style={{ color: C.mid, lineHeight: 1.6, margin: "0 0 4px" }}>Enter your mobile number. New here? We’ll send a code on WhatsApp so you can set your PIN.</p>
              {lbl("MOBILE NUMBER")}
              <div style={{ display: "flex" }}>
                <span style={{ ...field, width: "auto", display: "flex", alignItems: "center", borderRight: 0, fontSize: 16 }}>+91</span>
                <input ref={first} inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(e) => { setPhone(fmt(e.target.value)); setErr(""); }} placeholder="98450 21734" style={field} />
              </div>
              {errBox}
              <button type="submit" disabled={busy} style={btn}>{busy ? "ONE MOMENT" : "CONTINUE →"}</button>
              <a href="/free-trial" style={{ display: "block", marginTop: 22, padding: 16, border: `1px solid ${C.line}`, color: C.fg, font: "600 14px/1 Manrope,sans-serif" }}>New to Dojo X? Book a free trial →</a>
            </form>
          )}

          {mode === "pin" && (
            <form onSubmit={(e) => { e.preventDefault(); login(); }}>
              {kicker("+91 " + fmt(digits))}{h1("Enter your PIN")}
              <input ref={first} type="password" inputMode="numeric" autoComplete="current-password" maxLength={6} value={pin} onChange={(e) => { const v = only6(e.target.value); setPin(v); setErr(""); if (v.length === 6) login(v); }} placeholder="······" style={pinField} aria-label="6-digit PIN" />
              {errBox}
              <button type="submit" disabled={busy || pin.length !== 6} style={{ ...btn, background: pin.length === 6 ? C.red : "#333" }}>{busy ? "CHECKING" : "SIGN IN →"}</button>
              <div style={{ marginTop: 20 }}><button type="button" style={ghost} onClick={sendCode} disabled={busy}>Forgot your PIN? Get a code on WhatsApp</button></div>
              {back("phone")}
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={(e) => { e.preventDefault(); check(); }}>
              {kicker("CHECK WHATSAPP")}{h1("Enter the code")}
              <p style={{ color: C.mid, lineHeight: 1.6, margin: "0 0 18px" }}>We sent a 6-digit code to <b style={{ color: C.fg }}>+91 {fmt(digits)}</b> on WhatsApp. It expires in 10 minutes.</p>
              <input ref={first} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => { const v = only6(e.target.value); setCode(v); setErr(""); if (v.length === 6) check(v); }} placeholder="······" style={pinField} aria-label="6-digit code" />
              {dev && <div style={{ marginTop: 10, color: C.dim, font: "500 12px/1.4 'JetBrains Mono',monospace" }}>DEV ONLY · code {dev}</div>}
              {errBox}
              <button type="submit" disabled={busy || code.length !== 6} style={{ ...btn, background: code.length === 6 ? C.red : "#333" }}>{busy ? "CHECKING" : "VERIFY →"}</button>
              <div style={{ marginTop: 20 }}><button type="button" style={{ ...ghost, opacity: wait ? 0.5 : 1 }} disabled={wait > 0 || busy} onClick={sendCode}>{wait ? `Resend code in 0:${String(wait).padStart(2, "0")}` : "Resend code"}</button></div>
              {back("phone")}
            </form>
          )}

          {mode === "newpin" && (
            <form onSubmit={save}>
              {kicker("LAST STEP")}{h1("Set your PIN")}
              <p style={{ color: C.mid, lineHeight: 1.6, margin: "0 0 4px" }}>Pick a 6-digit PIN you’ll remember. You’ll use it to sign in next time, so there’s no need to wait for a code. Don’t use your birth year or 123456.</p>
              {lbl("NEW PIN")}
              <input ref={first} type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} value={pin} onChange={(e) => { setPin(only6(e.target.value)); setErr(""); }} placeholder="······" style={pinField} />
              {lbl("CONFIRM PIN")}
              <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={6} value={pin2} onChange={(e) => { setPin2(only6(e.target.value)); setErr(""); }} placeholder="······" style={pinField} />
              {errBox}
              <button type="submit" disabled={busy} style={btn}>{busy ? "SAVING" : "SAVE PIN & CONTINUE →"}</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

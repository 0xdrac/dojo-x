"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DojoAPI } from "@/lib/api";
import { googleRedirectResult, preloadFirebase, signInWithGoogle } from "@/lib/firebase";

const Login = dynamic(() => import("@/screens/Login"), { ssr: false });
const C = { bg: "#0D0D0D", line: "#262626", fg: "#F5F5F5", mid: "#C9C9C9", dim: "#9A9A9A", red: "#C8102E", err: "oklch(0.78 0.16 40)" };

/**
 * Sign-in with Google only. Staff use the same button; their Gmail decides where they land (Admin or Coach app).
 * Once signed in (or when finishing sign-up) this hands over to the sign-up form.
 */
export default function GoogleLogin() {
  const [mode, setMode] = useState<"boot" | "form" | "working" | "app">("boot");
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);

  const finish = async (idToken: string) => {
    const r = await DojoAPI.verifyToken(idToken);
    if (!r.ok) { setErr(r.error || "Sign-in failed. Please try again."); setMode("form"); history.replaceState(null, "", "/login"); return; }
    history.replaceState(null, "", "/login");
    if (r.staff) return void (location.href = r.staff.role === "coach" ? "/coach-app" : "/admin");
    if (r.onboarded) { let n: string | null = null; try { n = sessionStorage.getItem("dx-next"); sessionStorage.removeItem("dx-next"); } catch {} return void (location.href = n && n.startsWith("/") && !n.startsWith("//") ? n : "/member-portal"); }
    history.replaceState(null, "", "/login#onboard"); setMode("app");   // straight into the form, no reload
  };

  useEffect(() => {
    preloadFirebase(); import("@/screens/Login");   // get Google and the sign-up form ready while the page is still showing
    (async () => {
      const h = location.hash.slice(1);
      if (h === "logout") { await DojoAPI.logout(); history.replaceState(null, "", "/login"); return setMode("form"); }
      if (h === "onboard" || h === "family") return setMode("app");
      const gr = await googleRedirectResult();
      if (gr?.idToken) { setMode("working"); return finish(gr.idToken); }
      if (gr?.error) setErr(gr.error);
      const me = await DojoAPI.me(); if (me.ok) {
        if (me.onboarded) { let n: string | null = null; try { n = sessionStorage.getItem("dx-next"); sessionStorage.removeItem("dx-next"); } catch {} location.replace(n && n.startsWith("/") && !n.startsWith("//") ? n : "/member-portal"); return; }
        history.replaceState(null, "", "/login#onboard"); return setMode("app");
      }
      const st = await DojoAPI.staffMe(); if (st.ok) { location.href = st.staff.role === "coach" ? "/coach-app" : "/admin"; return; }
      setMode("form");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const google = async () => {
    setBusy(true); setErr("");
    const r = await signInWithGoogle(); setBusy(false);
    if (r.redirecting) return;
    if (!r.ok) return void (r.error && setErr(r.error));
    setMode("working"); await finish(r.idToken!);
  };

  if (mode === "app") return <Login />;
  const kicker = (t: string) => <div style={{ font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: C.dim }}>{t}</div>;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.fg, fontFamily: "Manrope,sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "22px clamp(16px,4vw,48px)" }}><a href="/" style={{ fontFamily: "Anton,Impact,sans-serif", fontSize: 28, letterSpacing: ".04em", color: C.fg }}>DOJO<span style={{ color: C.red }}>X</span></a></header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {(mode === "boot" || mode === "working") && <p style={{ color: C.dim }}>{mode === "working" ? "Signing you in…" : "Loading…"}</p>}
          {mode === "form" && (
            <div>
              {kicker("MEMBER LOGIN")}
              <h1 style={{ fontFamily: "Anton,Impact,sans-serif", fontWeight: 400, fontSize: 52, lineHeight: 1, margin: "12px 0 10px", textTransform: "uppercase" }}>Welcome back<span style={{ color: C.red }}>.</span></h1>
              <p style={{ color: C.mid, lineHeight: 1.6, margin: "0 0 22px" }}>Sign in with your Google account. New here? The same button creates your account. No password needed.</p>
              <button type="button" onClick={google} disabled={busy} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: 17, background: "#F5F5F5", border: 0, color: "#0D0D0D", font: "800 14px/1 Manrope,sans-serif", letterSpacing: ".04em", cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17.5z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
                {busy ? "OPENING GOOGLE…" : "CONTINUE WITH GOOGLE"}
              </button>
              {err && <div role="alert" style={{ color: C.err, marginTop: 12, font: "600 13px/1.4 Manrope,sans-serif" }}>{err}</div>}
              <a href="/free-trial" style={{ display: "block", marginTop: 22, padding: 16, border: `1px solid ${C.line}`, color: C.fg, font: "600 14px/1 Manrope,sans-serif" }}>New to Dojo X? Book a free trial →</a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";
import { useEffect } from "react";

/** Shown instead of a blank page if something on a screen crashes. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  const btn = { display: "inline-flex", alignItems: "center", justifyContent: "center", height: 52, padding: "0 22px", font: "800 13px/1 Manrope,sans-serif", letterSpacing: ".08em", cursor: "pointer" } as const;
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "96px 16px 48px", background: "#0D0D0D", color: "#F5F5F5" }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: "#9A9A9A" }}>SOMETHING WENT WRONG</div>
        <h1 style={{ fontFamily: "Anton,Impact,sans-serif", fontWeight: 400, fontSize: "clamp(44px,11vw,88px)", lineHeight: 0.95, margin: "14px 0", textTransform: "uppercase" }}>Took a hit<span style={{ color: "#C8102E" }}>.</span></h1>
        <p style={{ font: "500 16px/1.6 Manrope,sans-serif", color: "#C9C9C9", margin: "0 0 26px" }}>This page hit an error. Try again, and if it keeps happening, message the front desk.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={reset} style={{ ...btn, background: "#C8102E", color: "#F5F5F5", border: 0 }}>TRY AGAIN</button>
          <a href="/" style={{ ...btn, border: "1px solid #2E2E2E", color: "#F5F5F5" }}>BACK TO HOME</a>
        </div>
      </div>
    </main>
  );
}

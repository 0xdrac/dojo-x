import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  const btn = { display: "inline-flex", alignItems: "center", justifyContent: "center", height: 52, padding: "0 22px", font: "800 13px/1 Manrope,sans-serif", letterSpacing: ".08em" } as const;
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "96px 16px 48px", background: "#0D0D0D", color: "#F5F5F5" }}>
      <div style={{ maxWidth: 520 }}>
        <div style={{ font: "700 11px/1 'JetBrains Mono',monospace", letterSpacing: ".18em", color: "#9A9A9A" }}>ERROR 404</div>
        <h1 style={{ fontFamily: "Anton,Impact,sans-serif", fontWeight: 400, fontSize: "clamp(48px,12vw,96px)", lineHeight: 0.95, margin: "14px 0", textTransform: "uppercase" }}>Wrong corner<span style={{ color: "#C8102E" }}>.</span></h1>
        <p style={{ font: "500 16px/1.6 Manrope,sans-serif", color: "#C9C9C9", margin: "0 0 26px" }}>That page doesn’t exist or has moved. Head back to the mat.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/" style={{ ...btn, background: "#C8102E", color: "#F5F5F5" }}>BACK TO HOME</Link>
          <Link href="/free-trial" style={{ ...btn, border: "1px solid #2E2E2E", color: "#F5F5F5" }}>BOOK A FREE TRIAL</Link>
          <Link href="/schedule" style={{ ...btn, border: "1px solid #2E2E2E", color: "#F5F5F5" }}>CLASS SCHEDULE</Link>
        </div>
      </div>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import TLink from "./TLink";
import { NAV, PHONE } from "@/lib/data";

export default function Header() {
  const [sc, setSc] = useState(false);
  const [menu, setMenu] = useState(false);
  const [past, setPast] = useState(false);

  useEffect(() => {
    const f = () => { setSc(window.scrollY > 40); setPast(window.scrollY > window.innerHeight * 0.75); };
    const close = () => setMenu(false);
    f(); window.addEventListener("scroll", f, { passive: true }); window.addEventListener("dx-close-menu", close);
    return () => { window.removeEventListener("scroll", f); window.removeEventListener("dx-close-menu", close); document.body.style.overflow = ""; };
  }, []);

  const toggle = () => { const m = !menu; document.body.style.overflow = m ? "hidden" : ""; setMenu(m); };

  useEffect(() => {
    if (!menu || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const E = "cubic-bezier(.7,0,.2,1)";
    document.querySelector("[data-menu-panel]")?.animate([{ clipPath: "polygon(0 0,0 0,-30% 100%,-30% 100%)" }, { clipPath: "polygon(0 0,130% 0,100% 100%,-30% 100%)" }], { duration: 380, easing: E });
    document.querySelectorAll("[data-menu-item]").forEach((el, i) => el.animate(
      [{ opacity: 0, transform: "translateX(-80px)" }, { opacity: 1, transform: "none" }],
      { duration: 420, delay: 90 + i * 45, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
  }, [menu]);

  return (
    <>
      <header className={"hdr" + (sc && !menu ? " sc" : "") + (menu ? " mn" : "")}>
        <div className="bar">
          <TLink href="#top" className="logo" aria-label="Dojo X, home" onClick={(e) => { if (location.pathname !== "/") { e.preventDefault(); location.assign("/"); } }}>
            <i />
            <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="anton" style={{ fontSize: 24, lineHeight: 1, letterSpacing: ".06em", color: "var(--fg)" }}>DOJO X</span>
              <span className="mono" style={{ fontSize: 8.5, lineHeight: 1, letterSpacing: ".34em", color: "var(--dim)" }}>FIGHT ACADEMY</span>
            </span>
          </TLink>
          <nav className="nav" aria-label="Main">
            {NAV.map(([l, h]) => <TLink key={h} href={h}>{l}</TLink>)}
          </nav>
          <TLink href="/login" className="dk" style={{ font: "700 12px/1 var(--sans)", letterSpacing: ".12em", textTransform: "uppercase", padding: "14px 4px", borderBottom: "1px solid #2E2E2E" }}>Member Login</TLink>
          <TLink href="/schedule" className="btn dk" style={{ flex: "none" }}>
            <span className="in" style={{ height: 44, padding: "0 18px", fontSize: 12, gap: 10, clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}>
              <span className="fill" /><span className="shine" data-shine="" /><span className="lbl">Free Trial</span><span className="arr">→</span>
            </span>
          </TLink>
          <div className="mb" style={{ marginLeft: "auto", alignItems: "center", gap: 8 }}>
            <TLink href="/schedule" className="pill">Free Trial</TLink>
            <button className="burger" onClick={toggle} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu}>
              <span style={{ width: 20, background: "var(--fg)", transform: menu ? "translateY(4.5px) rotate(45deg)" : "none" }} />
              <span style={{ width: menu ? 20 : 13, background: "var(--red)", transform: menu ? "translateY(-4.5px) rotate(-45deg)" : "none" }} />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div data-menu-panel="" className="menu">
          <div style={{ position: "absolute", top: 0, bottom: 0, right: "-30%", width: "60%", background: "var(--red)", opacity: 0.1, transform: "skewX(-18deg)", pointerEvents: "none" }} />
          <nav aria-label="Mobile" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
            {NAV.map(([l, h], i) => (
              <TLink key={h} href={h} className="it" data-menu-item=""><b>{String(i + 1).padStart(2, "0")}</b><span>{l}</span></TLink>
            ))}
          </nav>
          <div data-menu-item="" style={{ position: "relative", marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <TLink href="#pricing" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 56, background: "var(--red)", color: "var(--fg)", font: "800 14px/1 var(--sans)", letterSpacing: ".1em", textTransform: "uppercase", clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}>Book Free Trial →</TLink>
            <TLink href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 56, border: "1px solid #2E2E2E", font: "700 14px/1 var(--sans)", letterSpacing: ".1em", textTransform: "uppercase" }}>Member Login</TLink>
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", font: "500 12px/1.4 var(--mono)", color: "var(--dim)", paddingTop: 8 }}><span>{PHONE}</span><span>Vasundhara, GZB</span></div>
          </div>
        </div>
      )}

      <a href="https://wa.me/919845021734?text=Hi%20Dojo%20X%2C%20I%27d%20like%20a%20free%20trial" target="_blank" rel="noopener"
        aria-label="Chat with us on WhatsApp" className={"wa" + (past && !menu ? " up" : "")}>WA</a>
      <div className={"sticky" + (past && !menu ? " show" : "")}>
        <TLink href="#pricing" style={{ flex: 1, border: "1px solid #2E2E2E", color: "var(--fg)" }}>Join Now</TLink>
        <TLink href="/schedule" style={{ flex: 1.4, position: "relative", overflow: "hidden", gap: 8, background: "var(--red)", color: "var(--fg)", clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}>
          <span className="shine" data-shine="" /><span style={{ position: "relative" }}>Book Free Trial →</span>
        </TLink>
      </div>
    </>
  );
}

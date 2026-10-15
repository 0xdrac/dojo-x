"use client";
import { useEffect, useState } from "react";
import TLink from "./TLink";

/** WhatsApp button + mobile sticky CTA bar for the Home page (other pages get them from SiteFooter). */
export default function HomeFloaters() {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const f = () => setPast(window.scrollY > window.innerHeight * 0.75);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <>
      <a href="https://wa.me/919845021734?text=Hi%20Dojo%20X%2C%20I%27d%20like%20a%20free%20trial" target="_blank" rel="noopener"
        aria-label="Chat with us on WhatsApp" className={"wa" + (past ? " up" : "")}>WA</a>
      <div className={"sticky" + (past ? " show" : "")}>
        <TLink href="#pricing" style={{ flex: 1, border: "1px solid #2E2E2E", color: "var(--fg)" }}>Join Now</TLink>
        <TLink href="/schedule" style={{ flex: 1.4, position: "relative", overflow: "hidden", gap: 8, background: "var(--red)", color: "var(--fg)", clipPath: "polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)" }}>
          <span className="shine" data-shine="" /><span style={{ position: "relative" }}>Book Free Trial →</span>
        </TLink>
      </div>
    </>
  );
}

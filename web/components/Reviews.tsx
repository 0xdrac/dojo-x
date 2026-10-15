"use client";
import { useRef } from "react";
import { useShell } from "./Shell";
import { REVIEWS, hue, hueOf } from "@/lib/data";

export default function Reviews() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useShell();
  const scroll = (dir: number) => {
    const el = ref.current; if (!el) return;
    const c = el.firstElementChild as HTMLElement | null;
    el.scrollBy({ left: dir * ((c ? c.offsetWidth : 400) + 16), behavior: reduced() ? "auto" : "smooth" });
  };
  return (
    <section id="reviews" className="sec" data-screen-label="Reviews" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="wrap" style={{ padding: "0 var(--pad)" }}>
        <div data-reveal="" className="sh" style={{ marginBottom: "clamp(28px,4vw,48px)" }}>
          <div><div className="eyebrow">04 / FROM THE MAT</div><h2 className="anton h2">Don&apos;t take<br />our word.</h2></div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: "1px solid #2E2E2E", background: "#161616" }}>
              <span className="anton" style={{ fontSize: 36, lineHeight: 1, color: "var(--fg)" }}>4.9</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ color: "oklch(0.82 0.14 85)", fontSize: 14, letterSpacing: 2 }}>★★★★★</span>
                <span className="mono" style={{ font: "500 11px/1 var(--mono)", color: "var(--dim)" }}>612 GOOGLE REVIEWS</span>
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="arrowbtn" aria-label="Previous review" onClick={() => scroll(-1)}>←</button>
              <button className="arrowbtn p" aria-label="Next review" onClick={() => scroll(1)}>→</button>
            </div>
          </div>
        </div>
      </div>
      <div ref={ref} className="rev">
        {REVIEWS.map((r) => (
          <figure key={r.who} data-reveal="">
            <b>“</b>
            <blockquote>{r.q}</blockquote>
            <figcaption>
              <span><span style={{ display: "block", font: "700 15px/1.2 var(--sans)", color: "var(--fg)" }}>{r.who}</span>
                <span className="mono" style={{ display: "block", marginTop: 4, font: "500 11px/1 var(--mono)", color: "var(--dim)" }}>{r.meta}</span></span>
              <span className="tag"><i style={{ background: hue(hueOf(r.tag)) }} />{r.tag}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

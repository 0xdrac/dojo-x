"use client";
import TLink from "./TLink";
import Slot from "./Slot";
import { useShell } from "./Shell";
import { COACHES, hue, hueOf } from "@/lib/data";

export default function Coaches() {
  const { reduced } = useShell();
  const tilt = (e: React.MouseEvent<HTMLElement>) => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches || reduced()) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 9).toFixed(2) + "deg");
    el.style.setProperty("--rx", ((-((e.clientY - r.top) / r.height - 0.5)) * 7).toFixed(2) + "deg");
  };
  const untilt = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.setProperty("--ry", "0deg"); e.currentTarget.style.setProperty("--rx", "0deg"); };

  return (
    <section id="coaches" className="sec" data-screen-label="Coaches">
      <div data-parallax="0.1" aria-hidden="true" className="bgword" style={{ top: 30, left: "-2vw", fontSize: "clamp(160px,26vw,400px)", color: "transparent", WebkitTextStroke: "1px rgba(245,245,245,.06)" }}>CORNER</div>
      <div className="wrap">
        <div data-reveal="" className="sh">
          <div><div className="eyebrow">02 / YOUR CORNER</div><h2 className="anton h2">Train with<br /><span className="outline">champions.</span></h2></div>
          <TLink href="/coaches" className="ulink">All coaches <span className="arr">→</span></TLink>
        </div>
        <div className="cgrid">
          {COACHES.map((c) => (
            <article key={c.id} data-reveal="" data-tilt="" className="coach" onMouseMove={tilt} onMouseLeave={untilt}>
              <div className="pic stripe" style={{ background: "repeating-linear-gradient(135deg,#191919 0 12px,#151515 12px 24px)" }}>
                <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) contrast(1.25)" }}><Slot ph={c.ph} /></div>
                <div className="tint" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(22,22,22,0) 50%,#161616)", pointerEvents: "none" }} />
                <div className="badge">{c.role}</div>
                <div aria-hidden="true" className="big">{c.num}</div>
              </div>
              <div className="body">
                <div className="anton" style={{ fontSize: 22, lineHeight: 1, color: "var(--mid)" }}>{c.first}</div>
                <div className="mono" style={{ margin: "6px 0 4px", font: "500 13px/1 var(--mono)", color: "var(--fg)" }}>“{c.nick}”</div>
                <div className="anton" style={{ fontSize: "clamp(48px,5vw,64px)", lineHeight: 0.95, color: "var(--fg)" }}>{c.last}</div>
                <div className="rec">
                  {["WINS", "LOSSES", "DRAWS"].map((l, i) => <div key={l}><b>{c.rec[i]}</b><span>{l}</span></div>)}
                </div>
                <div className="info">{c.info.map(([k, v]) => <div key={k}><small>{k}</small><span>{v}</span></div>)}</div>
                <div className="bars">
                  {c.bars.map(([k, v], i) => (
                    <div className="bar3" key={k}>{k}<span className="tr"><i style={{ ["--v" as string]: v + "%", transitionDelay: i * 0.06 + "s" }} /></span><b>{v}</b></div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 18 }}>
                  {c.tags.map((t) => <span className="tag" key={t}><i style={{ background: hue(hueOf(t)) }} />{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

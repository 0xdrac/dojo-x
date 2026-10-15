"use client";
import { useEffect, useRef, useState } from "react";
import Btn from "./Btn";
import TLink from "./TLink";
import { useShell } from "./Shell";
import { DISCIPLINES, DURS, PLANS, TIERS, YOGA_PRICE, fmt, hue, type PlanKey } from "@/lib/data";

const GREEN = "oklch(0.78 0.14 150)";

export default function Pricing() {
  const { reduced } = useShell();
  const [sel, setSel] = useState<string[]>(["MMA", "Muay Thai"]);
  const [dur, setDur] = useState<PlanKey>("quarterly");
  const priceRef = useRef<HTMLSpanElement>(null);
  const last = useRef<number>(undefined);

  const fight = sel.filter((k) => k !== "Yoga"), yoga = sel.includes("Yoga"), n = sel.length;
  const eff: PlanKey = fight.length ? dur : "monthly", D = PLANS[eff];
  const per = Math.round((fight.length * D.p / D.m + (yoga ? YOGA_PRICE : 0)) * 0.95);
  const base = fight.length * 4999 + (yoga ? YOGA_PRICE : 0);

  useEffect(() => {
    if (last.current !== undefined && last.current !== per && !reduced())
      priceRef.current?.animate([{ transform: "scale(1.16)", color: "#FFFFFF" }, { transform: "scale(1)" }], { duration: 300, easing: "cubic-bezier(.7,0,.2,1)" });
    last.current = per;
  }, [per, reduced]);

  const lines: [string, string, string][] = n ? [] : [["Nothing selected yet", "—", "var(--dim)"]];
  if (fight.length) lines.push([`${fight.length} discipline${fight.length > 1 ? "s" : ""} · ${D.l}`, fmt(fight.length * D.p), "var(--mid)"]);
  if (yoga) lines.push(["Yoga · monthly only", fmt(YOGA_PRICE) + "/mo", "var(--mid)"]);
  if (n) lines.push(["Member discount", "−5%", GREEN]);

  return (
    <section id="pricing" className="sec alt" data-screen-label="Pricing teaser">
      <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: "-12%", width: "30%", background: "var(--red)", opacity: 0.06, transform: "skewX(-18deg)", pointerEvents: "none" }} />
      <div className="pgrid">
        <div data-reveal="">
          <div className="eyebrow">03 / MEMBERSHIP</div>
          <h2 className="anton h2">Build your<br />own <span className="red">combo.</span></h2>
          <p style={{ margin: "20px 0 0", maxWidth: 440, fontSize: 16, lineHeight: 1.6, color: "var(--mid)", textWrap: "pretty" }}>
            ₹4,999 a month per discipline, down to ₹2,500 a month on an annual plan. Yoga is ₹2,599 a month. Everyone gets 5% off, partners get 10%, and coupon codes stack on top.
          </p>
          <div className="tiers">
            {TIERS.map(([k, label, off]) => (
              <div key={k} style={{ color: eff === k ? "var(--fg)" : "var(--dim)" }}>
                <span><i style={{ background: eff === k ? "var(--red)" : "#333" }} />{label}</span><span>{off}</span>
              </div>
            ))}
          </div>
        </div>
        <div data-reveal="" className="builder">
          <div className="step">1 · PICK DISCIPLINES</div>
          <div role="group" aria-label="Disciplines" className="chips">
            {DISCIPLINES.map((d) => {
              const on = sel.includes(d.name);
              return (
                <button key={d.slug} className={"chip" + (on ? " on" : "")} aria-pressed={on}
                  onClick={() => setSel((s) => (s.includes(d.name) ? s.filter((x) => x !== d.name) : [...s, d.name]))}>
                  <span className="sw" style={{ background: hue(d.hue) }} />
                  <span><b>{d.name}</b><small>{fmt(d.price)}</small></span>
                  <span className="mk">{on ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
          <div className="step" style={{ marginTop: 28 }}>2 · DURATION</div>
          <div role="radiogroup" aria-label="Duration" className="durs">
            {DURS.map(([k, label, note]) => (
              <button key={k} role="radio" aria-checked={dur === k} className={"dur" + (dur === k ? " on" : "")} onClick={() => setDur(k)}>
                <b>{label}</b><small>{note}</small>
              </button>
            ))}
          </div>
          <div className="lines">
            {lines.map(([k, v, c]) => <div key={k}><span>{k}</span><span style={{ color: c }}>{v}</span></div>)}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 14, padding: 0 }}>
              <div style={{ display: "block", padding: 0 }}>
                <div className="step">YOUR PRICE</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
                  <span ref={priceRef} className="price">{n ? fmt(per) : "₹0"}</span>
                  <span style={{ font: "600 14px/1 var(--sans)", color: "var(--dim)" }}>/month</span>
                </div>
              </div>
              <div className="mono" style={{ display: "block", padding: 0, font: "600 12px/1.3 var(--mono)", color: GREEN, textAlign: "right", maxWidth: 220 }}>
                {n && base - per > 0 ? `You save ${fmt((base - per) * 12)} a year` : n ? "5% member discount applied" : "Pick at least one discipline"}
              </div>
            </div>
            <div style={{ display: "block", marginTop: 10, padding: 0, font: "500 12px/1.5 var(--sans)", color: "var(--dim)" }}>
              {n ? `${D.l} plan. Join with a partner for 10% off, and apply coupon codes at checkout.` : "Tap a discipline above to see live pricing."}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
            <Btn href="/pricing" flex="1 1 220px" shine={false}>Join with this plan</Btn>
            <TLink href="/pricing" className="ulink" style={{ minHeight: 56, padding: "0 8px", letterSpacing: ".1em" }}>Compare combos</TLink>
          </div>
        </div>
      </div>
    </section>
  );
}

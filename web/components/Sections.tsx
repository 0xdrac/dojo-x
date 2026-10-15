import TLink from "./TLink";
import Btn from "./Btn";
import Slot from "./Slot";
import NextUp from "./NextUp";
import { DISCIPLINES, STATS, GALLERY, hue, MAPS, PHONE, PHONE_TEL, WA, EMAIL } from "@/lib/data";

const SH = ({ no, children }: { no: string; children?: React.ReactNode }) => <div className="eyebrow">{no}{children}</div>;

export function Hero() {
  return (
    <section id="top" className="hero" data-screen-label="Hero">
      <div data-parallax="0.3" className="stripe" style={{ position: "absolute", inset: "-10% 0", color: "var(--dim)", filter: "grayscale(1) contrast(1.3) brightness(.85)" }}>
        <Slot ph="HERO LOOP · B&W slow-mo sparring, side-lit, sweat flying (poster frame for 4G)" />
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg,rgba(13,13,13,.75) 0%,rgba(13,13,13,.15) 30%,rgba(13,13,13,.55) 60%,#0D0D0D 100%),linear-gradient(90deg,rgba(13,13,13,.7) 0%,rgba(13,13,13,0) 60%)" }} />
      {[0, 18, 36].map((o, i) => (
        <div key={o} style={{ position: "absolute", left: 0, right: 0, top: `calc(34% + ${o}px)`, height: 1, background: `rgba(245,245,245,${[.06, .05, .04][i]})`, pointerEvents: "none" }} />
      ))}
      <div data-parallax="-0.12" aria-hidden="true" className="bgword" style={{ top: "12%", left: "-2vw", fontSize: "31vw", color: "transparent", WebkitTextStroke: "1px rgba(245,245,245,.07)" }}>DOJO X</div>
      <div style={{ position: "relative", maxWidth: 1440, width: "100%", margin: "0 auto", padding: "0 var(--pad) 24px", pointerEvents: "none" }}>
        <div data-hero-fade="" className="mono" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, font: "500 12px/1 var(--mono)", letterSpacing: ".24em", color: "var(--fg)", textTransform: "uppercase" }}>
          <span style={{ width: 36, height: 2, background: "var(--red)" }} />Vasundhara, Ghaziabad · Est. 2013
        </div>
        <h1 data-shake="" className="anton">
          <span className="l"><span data-slam="" className="w">Forged</span> <span data-slam="" className="w outline">in</span></span>
          <span className="l"><span data-slam="" className="w outline">the</span> <span data-slam="" className="w">cage<span className="red">.</span></span></span>
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginTop: "clamp(20px,3vw,36px)" }}>
          <p data-hero-fade="" style={{ margin: 0, maxWidth: 440, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.55, color: "var(--mid)", textWrap: "pretty" }}>
            Seven disciplines. Pro fighters in your corner. Whether it&apos;s your first class or your first title fight, you start here.
          </p>
          <div data-hero-fade="" style={{ display: "flex", flexWrap: "wrap", gap: 12, flex: "1 1 320px", maxWidth: 560, pointerEvents: "auto" }}>
            <Btn href="#pricing" h={58}>Book your free trial</Btn>
            <TLink href="/schedule" className="ghost" style={{ flex: "1 1 180px" }}><span>View schedule</span></TLink>
          </div>
        </div>
        <div data-hero-fade="" style={{ display: "flex", alignItems: "stretch", marginTop: "clamp(28px,4vw,48px)", borderTop: "1px solid #262626", paddingTop: 12, pointerEvents: "auto" }}>
          <span className="mono" style={{ flex: "none", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", height: 36, background: "var(--red)", color: "var(--fg)", font: "700 11px/1 var(--mono)", letterSpacing: ".16em" }}>
            <span style={{ width: 6, height: 6, background: "var(--fg)", borderRadius: "50%" }} />NEXT UP
          </span>
          <span className="mono" style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", height: 36, padding: "0 14px", background: "rgba(20,20,20,.85)", color: "var(--fg)", font: "500 12px/1 var(--mono)", letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <NextUp />
          </span>
          <span className="mono dk" style={{ flex: "none", alignItems: "center", gap: 10, height: 36, paddingLeft: 20, color: "var(--dim)", font: "500 11px/1 var(--mono)", letterSpacing: ".2em" }}>
            SCROLL<span style={{ width: 40, height: 1, background: "var(--dim)" }} />
          </span>
        </div>
      </div>
    </section>
  );
}

const A = "MMA • BOXING • MUAY THAI • KICKBOXING • KARATE • GYMNASTICS • YOGA • MMA • BOXING • MUAY THAI • KICKBOXING • KARATE • GYMNASTICS • YOGA •";
const B = "EARN YOUR BELT • TRAIN LIKE A PRO • FIRST CLASS FREE • EARN YOUR BELT • TRAIN LIKE A PRO • FIRST CLASS FREE •";
export function Marquee() {
  return (
    <div className="marq" aria-hidden="true" data-screen-label="Marquee">
      <div className="band" style={{ top: "22%", transform: "rotate(-3deg)", background: "var(--red)" }}>
        <div className="track" data-marquee="" data-dir="1" style={{ color: "var(--ink)" }}><span>{A}</span><span>{A}</span></div>
      </div>
      <div className="band" style={{ top: "50%", transform: "rotate(2deg)", background: "#141414", borderTop: "1px solid #262626", borderBottom: "1px solid #262626" }}>
        <div className="track" data-marquee="" data-dir="-1" style={{ color: "transparent", WebkitTextStroke: "1px var(--fg)" }}><span>{B}</span><span>{B}</span></div>
      </div>
    </div>
  );
}

export function Disciplines() {
  return (
    <section id="disciplines" className="sec" data-screen-label="Disciplines">
      <div data-parallax="0.12" aria-hidden="true" className="bgword" style={{ top: 40, right: "-3vw", fontSize: "clamp(180px,32vw,480px)", color: "#141414" }}>MMA</div>
      <div className="wrap">
        <div data-reveal="" className="sh">
          <div><SH no="01 / DISCIPLINES" /><h2 className="anton h2">Seven ways<br />to <span className="red">fight.</span></h2></div>
          <p className="lede">Kids from 5, teens, adults and competitors. Beginner, intermediate and fight-team levels in every discipline.</p>
        </div>
        <div className="dgrid">
          {DISCIPLINES.map((d, i) => (
            <TLink key={d.slug} data-reveal="" href={`/discipline?d=${d.slug}`} className="card">
              <div className="ph stripe"><Slot ph={d.ph} /></div>
              <div className="tint" /><div className="fade" />
              <div className="no"><i style={{ background: hue(d.hue) }} />{String(i + 1).padStart(2, "0")}</div>
              <div className="tx"><h3>{d.name}</h3><p>{d.blurb}</p><em>EXPLORE →</em></div>
              <div className="ul" />
            </TLink>
          ))}
          <div data-reveal="" className="cta-card">
            <div aria-hidden="true" className="anton" style={{ position: "absolute", right: "-10%", bottom: "-6%", fontSize: "clamp(120px,16vw,240px)", lineHeight: 0.8, color: "transparent", WebkitTextStroke: "1px rgba(13,13,13,.35)" }}>01</div>
            <div className="mono" style={{ position: "relative", font: "700 11px/1 var(--mono)", letterSpacing: ".2em", color: "var(--fg)" }}>NOT SURE?</div>
            <div style={{ position: "relative" }}>
              <div className="anton" style={{ fontSize: "clamp(26px,3vw,42px)", lineHeight: 0.95, color: "var(--fg)" }}>First class<br />is on us.</div>
              <TLink href="#pricing" className="tb">Book trial <span>→</span></TLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const hex = "polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)";
  return (
    <section className="stats" data-screen-label="Stats" style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: "min(110vw,900px)", aspectRatio: "1", transform: "translate(-50%,-50%)", background: "rgba(245,245,245,.05)", clipPath: hex, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 1, background: "#141414", clipPath: hex }} />
      </div>
      <div className="sgrid">
        {STATS.map((s) => (
          <div key={s.label} data-reveal="">
            <div className="n"><span data-count={s.n}>{s.n}</span>{s.plus && <span className="red">+</span>}</div>
            <div className="k">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Gallery() {
  return (
    <section id="gallery" className="sec alt" data-screen-label="Gallery peek">
      <div className="wrap">
        <div data-reveal="" className="sh" style={{ marginBottom: "clamp(28px,4vw,48px)" }}>
          <div><SH no="05 / INSIDE THE GYM" /><h2 className="anton h2">Blood, sweat,<br /><span className="outline">gold.</span></h2></div>
          <TLink href="/gallery" className="ulink">Full gallery <span className="arr">→</span></TLink>
        </div>
        <div className="ggrid">
          {GALLERY.map((g) => (
            <div key={g.id} data-reveal="" className={"stripe " + (g.cls || "")}>
              <div className="ph"><Slot ph={g.ph} /></div>
              {g.cap && <span className="cap">{g.cap}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Location() {
  return (
    <section id="location" className="sec" data-screen-label="Location">
      <div className="loc">
        <div data-reveal="" className="stripe" style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", color: "var(--dim)", border: "1px solid #262626" }}>
          <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) invert(.9) contrast(1.1)" }}><Slot ph="MAP EMBED · Google Maps, dark style" /></div>
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none" }}>
            <span className="mono" style={{ padding: "6px 10px", background: "var(--ink)", border: "1px solid var(--red)", font: "700 11px/1 var(--mono)", letterSpacing: ".14em", color: "var(--fg)" }}>DOJO X</span>
            <span style={{ width: 18, height: 18, background: "var(--red)", transform: "rotate(45deg)" }} />
          </div>
        </div>
        <div data-reveal="">
          <SH no="06 / FIND US" />
          <h2 className="anton" style={{ margin: 0, fontSize: "clamp(44px,6vw,88px)", lineHeight: 0.92, color: "var(--fg)" }}>Sector 12,<br />Vasundhara.</h2>
          <p style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.6, color: "var(--mid)" }}>
            Sai Complex, Plot No. 510, Maharaja Agarsain Marg, Sector 12, Vasundhara, Ghaziabad, Uttar Pradesh 201012. Easy access from NH-24 and Vaishali Metro. Parking available for members.
          </p>
          <div className="hours">
            <div><small>MON – SAT</small><b>5:30 AM – 10:00 PM</b></div>
            <div><small>SUNDAY</small><b>7:00 AM – 12:00 PM</b></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
            <a href={MAPS} target="_blank" rel="noopener" className="btn" style={{ flex: "1 1 200px", ["--bh" as string]: "52px" }}>
              <span className="in" style={{ fontSize: 13 }}><span className="fill" /><span className="lbl">Get directions</span><span className="arr">→</span></span>
            </a>
            <a href={`tel:${PHONE_TEL}`} className="outbtn">Call</a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="outbtn">WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="final" data-screen-label="Final CTA">
      <div data-parallax="0.15" aria-hidden="true" className="bgword" style={{ bottom: "-4vw", left: "-2vw", fontSize: "34vw", color: "transparent", WebkitTextStroke: "1px rgba(13,13,13,.3)" }}>ROUND 1</div>
      <div className="wrap">
        <div data-reveal="" className="mono" style={{ font: "700 12px/1 var(--mono)", letterSpacing: ".24em", color: "var(--fg)", marginBottom: 18 }}>NO CONTRACT · NO PAYMENT · NO EXPERIENCE NEEDED</div>
        <h2 data-reveal="" className="anton">Your first<br />round is <span style={{ color: "var(--ink)" }}>on us.</span></h2>
        <div data-reveal="" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "clamp(28px,4vw,44px)", maxWidth: 560 }}>
          <Btn href="/schedule" light flex="1 1 240px">Book free trial</Btn>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener" className="outbtn"
            style={{ flex: "1 1 180px", height: 60, border: 0, boxShadow: "inset 0 0 2px 0 #F5F5F5, inset 0 0 0 2px #F5F5F5", fontSize: 14 }}>Ask on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const q: [string, string][] = [["Programs", "#disciplines"], ["Schedule", "/schedule"], ["Pricing", "#pricing"], ["Coaches", "#coaches"], ["FAQs", "/faqs"], ["Blog", "/blog"]];
  return (
    <footer className="foot" data-screen-label="Footer">
      <div className="wrap">
        <div className="fgrid">
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <TLink href="#top" className="logo"><i /><span className="anton" style={{ fontSize: 28, lineHeight: 1, letterSpacing: ".06em", color: "var(--fg)" }}>DOJO X</span></TLink>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--dim)", maxWidth: 260 }}>Elite multi-discipline fight academy. Ghaziabad, since 2013.</p>
            <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 10, padding: "8px 12px", border: "1px solid #2E2E2E" }}>
              <span style={{ font: "800 13px/1 var(--sans)", color: "var(--fg)" }}>Google</span>
              <span className="anton" style={{ fontSize: 20, color: "var(--fg)" }}>4.9</span>
              <span style={{ color: "oklch(0.82 0.14 85)", fontSize: 12, letterSpacing: 1 }}>★★★★★</span>
            </div>
          </div>
          <div><div className="fh">VISIT</div><div className="ft">Sai Complex, Plot No. 510<br />Maharaja Agarsain Marg, Sector 12<br />Vasundhara, Ghaziabad, UP 201012</div></div>
          <div><div className="fh">HOURS</div><div className="ft">Mon – Sat · 5:30 AM – 10 PM<br />Sunday · 7 AM – 12 PM<br />Closed on national holidays</div></div>
          <div>
            <div className="fh">CONTACT</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, lineHeight: 1.5 }}>
              <a href={`tel:${PHONE_TEL}`}>{PHONE}</a><a href={`https://wa.me/${WA}`}>WhatsApp us</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <span style={{ display: "flex", gap: 14, marginTop: 8 }}>{["Instagram", "YouTube", "Facebook"].map((s) => <a key={s} href="#" style={{ color: "var(--mid)" }}>{s}</a>)}</span>
            </div>
          </div>
          <div>
            <div className="fh">QUICK LINKS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 14, lineHeight: 1.5 }}>
              {q.map(([l, h]) => <TLink key={l} href={h} style={{ color: "var(--mid)" }}>{l}</TLink>)}
            </div>
          </div>
        </div>
        <div className="mono" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginTop: 48, paddingTop: 20, borderTop: "1px solid #262626", font: "500 11px/1.6 var(--mono)", color: "var(--dim)" }}>
          <span>© 2026 DOJO X FIGHT ACADEMY PVT. LTD.</span><span>PRIVACY · TERMS · REFUND POLICY</span>
        </div>
      </div>
    </footer>
  );
}

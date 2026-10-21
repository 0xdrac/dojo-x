// @ts-nocheck
/* eslint-disable */
'use client';
// Ported from project/Gallery.dc.html by scripts/convert (template -> JSX, logic kept as-is).
import React from 'react';
import '@/lib/bootstrap';
import { DCLogic } from '@/lib/dc';
import { css, pc } from '@/lib/css';
import Slot from '@/components/Slot';
import SiteFooter from './SiteFooter';

class Screen extends DCLogic {
  static defaultProps = {};
  state = { w: window.innerWidth, ready: !!window.DOJO, cat: 'All', open: -1 };
  root = React.createRef(); gridRef = React.createRef(); lbRef = React.createRef();
  ITEMS = [
    ['Events', 'FIGHT NIGHT 09 · WALKOUT', '3/4'], ['MMA', 'CAGE WORK · FIGHT TEAM', '4/3'], ['Boxing', 'WRAPS, 6:58 AM', '1/1'],
    ['Karate', 'DECEMBER GRADING · ORANGE BELTS', '4/5'], ['Muay Thai', 'CLINCH LAB · KAVYA', '3/4'], ['Facility', 'THE FLOOR · 6,000 SQ FT', '16/9'],
    ['Kids', 'LITTLE WARRIORS · KIHON', '4/3'], ['Events', 'CHAMPIONS’ WALL', '3/4'], ['Boxing', 'HEAVY BAG ROW', '1/1'],
    ['MMA', 'OPEN MAT SUNDAY', '4/5'], ['Kids', 'KIDS GYMNASTICS · RINGS', '1/1'], ['Facility', 'YOGA STUDIO AT DAWN', '4/3'],
    ['Muay Thai', 'PAD ROUNDS', '4/5'], ['Events', 'STATE CHAMPIONSHIP · 3 GOLDS', '4/3']
  ];
  componentDidMount() {
    this._rs = () => window.innerWidth !== this.state.w && this.setState({ w: window.innerWidth }); window.addEventListener('resize', this._rs);
    this._kd = e => { if (this.state.open < 0) return; if (e.key === 'Escape') this.close(); if (e.key === 'ArrowRight') this.step(1); if (e.key === 'ArrowLeft') this.step(-1); };
    window.addEventListener('keydown', this._kd);
    DojoReady(() => this.setState({ ready: true }, () => DojoMotion.init(this.root.current)));
  }
  componentWillUnmount() { window.removeEventListener('resize', this._rs); window.removeEventListener('keydown', this._kd); document.body.style.overflow = ''; }
  componentDidUpdate(pp, ps) {
    const M = window.DojoMotion; if (!M) return;
    if (ps.cat !== this.state.cat && this.gridRef.current) M.stagger(this.gridRef.current.querySelectorAll('[data-item]'));
    if (ps.open !== this.state.open && this.state.open >= 0 && this.lbRef.current && !M.reduced()) {
      const img = this.lbRef.current.querySelector('[data-lbimg]'), dir = this.dir || 0;
      img && img.animate([{ opacity: 0, transform: `translateX(${dir * 60}px) scale(${dir ? 1 : .94})` }, { opacity: 1, transform: 'none' }], { duration: 300, easing: M.OUT });
    }
    document.body.style.overflow = this.state.open >= 0 ? 'hidden' : '';
  }
  list() { return this.ITEMS.map((x, i) => ({ i, cat: x[0], cap: x[1], ar: x[2] })).filter(x => this.state.cat === 'All' || x.cat === this.state.cat); }
  close = () => { this.dir = 0; this.setState({ open: -1 }); };
  step(d) { const L = this.list(); if (!L.length) return; const pos = L.findIndex(x => x.i === this.state.open); this.dir = d; this.setState({ open: L[(pos + d + L.length) % L.length].i }); }
  renderVals() {
    const { w, cat, open } = this.state, L = this.list();
    const cats = ['All', 'MMA', 'Boxing', 'Muay Thai', 'Karate', 'Kids', 'Events', 'Facility'];
    const cur = open >= 0 ? this.ITEMS[open] : null, pos = L.findIndex(x => x.i === open);
    return {
      root: this.root, gridRef: this.gridRef, lbRef: this.lbRef,
      cols: w >= 1100 ? 4 : w >= 700 ? 3 : 2, chipTop: w >= 1180 ? '76px' : '64px',
      chips: cats.map(c => ({ label: c, n: c === 'All' ? this.ITEMS.length : this.ITEMS.filter(x => x[0] === c).length, on: cat === c, bg: cat === c ? 'rgba(200,16,46,.16)' : '#161616', bd: cat === c ? '#C8102E' : '#2E2E2E', fg: cat === c ? '#F5F5F5' : '#C9C9C9', pick: () => this.setState({ cat: c }) })),
      items: L.map(x => ({ slot: `gallery-${x.i + 1}`, ph: x.cap, cap: x.cap, cat: x.cat.toUpperCase(), ar: x.ar, label: `Open photo: ${x.cap}`, open: () => { this.dir = 0; this.setState({ open: x.i }); } })),
      lbOpen: !!cur, close: this.close, prev: () => this.step(-1), next: () => this.step(1),
      lb: cur ? { slot: `gallery-${open + 1}`, ph: cur[1], cap: cur[1], cat: cur[0].toUpperCase(), ar: cur[2], idx: String(pos + 1).padStart(2, '0'), total: String(L.length).padStart(2, '0') } : {}
    };
  }
}

Screen.prototype.renderTemplate = function (v) {
  return (<><div ref={v.root} style={css("position:relative;overflow-x:clip")}><section data-screen-label={"Gallery hero"} style={css("position:relative;padding:clamp(110px,12vw,150px) clamp(16px,4vw,56px) clamp(24px,3vw,40px);overflow:hidden")}><div data-parallax={"-0.1"} aria-hidden={"true"} style={css("position:absolute;top:30px;right:-3vw;font-family:Anton,Impact,sans-serif;font-size:26vw;line-height:.8;white-space:nowrap;color:transparent;-webkit-text-stroke:1px rgba(245,245,245,.06);pointer-events:none")}>FRAMES</div><div style={css("position:relative;max-width:1328px;margin:0 auto")}><div data-hero-fade={""} style={css("display:flex;align-items:center;gap:10px;margin-bottom:18px;font:500 12px/1 'JetBrains Mono',monospace;letter-spacing:.2em;color:#9A9A9A")}><span>HOME</span><span style={css("color:#C8102E")}>/</span><span style={css("color:#F5F5F5")}>GALLERY</span></div><h1 data-shake={""} style={css("margin:0;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(60px,10vw,160px);line-height:.86;text-transform:uppercase;color:#F5F5F5")}><span data-slam={""} style={css("display:inline-block")}>Blood,</span> <span data-slam={""} style={css("display:inline-block")}>sweat,</span><br /><span data-slam={""} style={css("display:inline-block;color:transparent;-webkit-text-stroke:2px #F5F5F5")}>gold</span><span data-slam={""} style={css("display:inline-block;color:#C8102E")}>.</span></h1></div></section><div style={css(`position:sticky;top:${v.chipTop ?? ""};z-index:30;background:rgba(13,13,13,.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid #262626;border-bottom:1px solid #262626`)}><div role={"group"} aria-label={"Filter gallery"} style={css("max-width:1424px;margin:0 auto;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:10px clamp(16px,4vw,56px)")}>{(v.chips || []).map((c, $index) => (<React.Fragment key={$index}><button onClick={c?.pick} aria-pressed={c?.on} style={css(`flex:none;display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;background:${c?.bg ?? ""};border:1px solid ${c?.bd ?? ""};color:${c?.fg ?? ""};font:700 12px/1 Manrope,sans-serif;letter-spacing:.06em;text-transform:uppercase;cursor:pointer`)} className={[pc("active","transform:scale(.96)")].join(" ")}>{c?.label}<span style={css("font:500 10px/1 'JetBrains Mono',monospace;color:#9A9A9A")}>{c?.n}</span></button></React.Fragment>))}</div></div><section data-screen-label={"Masonry"} style={css("padding:clamp(20px,3vw,32px) clamp(16px,4vw,56px) clamp(72px,9vw,128px)")}><div ref={v.gridRef} style={css(`max-width:1328px;margin:0 auto;columns:${v.cols ?? ""};column-gap:clamp(8px,1vw,14px)`)}>{(v.items || []).map((it, $index) => (<React.Fragment key={$index}><button onClick={it?.open} aria-label={it?.label} data-item={""} style={css(`--h:0;position:relative;display:block;width:100%;margin:0 0 clamp(8px,1vw,14px);padding:0;border:0;background:repeating-linear-gradient(135deg,#191919 0 12px,#151515 12px 24px);aspect-ratio:${it?.ar ?? ""};overflow:hidden;break-inside:avoid;cursor:pointer;color:#9A9A9A`)} className={[pc("hover","--h:1")].join(" ")}><span style={css("position:absolute;inset:0;filter:grayscale(calc(1 - var(--h))) contrast(1.2);transform:scale(calc(1 + var(--h) * .05));transition:transform .45s cubic-bezier(.7,0,.2,1),filter .4s;pointer-events:none")}><Slot ph={`${it?.ph ?? ""}`} /></span><span style={css("position:absolute;inset:0;background:#C8102E;mix-blend-mode:multiply;opacity:calc(var(--h) * .45);transition:opacity .3s;pointer-events:none")}></span><span style={css("position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;gap:8px;padding:12px;background:linear-gradient(180deg,rgba(13,13,13,0),rgba(13,13,13,.85));transform:translateY(calc((1 - var(--h)) * 100%));transition:transform .3s cubic-bezier(.7,0,.2,1);pointer-events:none")}><span style={css("font:700 11px/1.3 'JetBrains Mono',monospace;letter-spacing:.1em;color:#F5F5F5;text-align:left")}>{it?.cap}</span><span style={css("font:700 14px/1 Manrope,sans-serif;color:#F5F5F5")}>⤢</span></span><span style={css("position:absolute;top:10px;left:10px;padding:5px 7px;background:#0D0D0D;font:700 10px/1 'JetBrains Mono',monospace;letter-spacing:.12em;color:#F5F5F5;pointer-events:none")}>{it?.cat}</span></button></React.Fragment>))}</div></section>{(v.lbOpen) && (<><div ref={v.lbRef} role={"dialog"} aria-modal={"true"} aria-label={"Photo viewer"} style={css("position:fixed;inset:0;z-index:70;background:rgba(8,8,8,.97);display:flex;flex-direction:column")}><div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px clamp(16px,3vw,32px)")}><span style={css("font:500 12px/1 'JetBrains Mono',monospace;letter-spacing:.16em;color:#9A9A9A")}><span style={css("color:#F5F5F5")}>{v.lb?.idx}</span> / {v.lb?.total} · {v.lb?.cat}</span><button onClick={v.close} aria-label={"Close"} style={css("width:48px;height:48px;background:transparent;border:1px solid #2E2E2E;color:#F5F5F5;font-size:18px;cursor:pointer")} className={[pc("hover","background:#1D1D1D")].join(" ")}>✕</button></div><div style={css("flex:1;min-height:0;display:flex;align-items:center;justify-content:center;gap:12px;padding:0 clamp(8px,2vw,24px)")}><button onClick={v.prev} aria-label={"Previous photo"} style={css("flex:none;width:52px;height:52px;background:#1A1A1A;border:1px solid #2E2E2E;color:#F5F5F5;font-size:20px;cursor:pointer")} className={[pc("hover","background:#C8102E;border-color:#C8102E"), pc("active","transform:scale(.94)")].join(" ")}>←</button><div data-lbimg={""} style={css(`position:relative;height:min(100%,80svh);aspect-ratio:${v.lb?.ar ?? ""};max-width:100%;color:#9A9A9A;background:repeating-linear-gradient(135deg,#191919 0 12px,#151515 12px 24px)`)}><Slot ph={`${v.lb?.ph ?? ""}`} /></div><button onClick={v.next} aria-label={"Next photo"} style={css("flex:none;width:52px;height:52px;background:#1A1A1A;border:1px solid #2E2E2E;color:#F5F5F5;font-size:20px;cursor:pointer")} className={[pc("hover","background:#C8102E;border-color:#C8102E"), pc("active","transform:scale(.94)")].join(" ")}>→</button></div><div style={css("padding:16px clamp(16px,3vw,32px) 24px;display:flex;align-items:baseline;gap:14px")}><span style={css("width:28px;height:2px;background:#C8102E;flex:none")}></span><span style={css("font:700 15px/1.4 Manrope,sans-serif;color:#F5F5F5")}>{v.lb?.cap}</span></div></div></>)}<SiteFooter  /></div></>);
};

export default Screen;

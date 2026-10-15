/* eslint-disable */
// @ts-nocheck
// Client-side motion helpers used by the screens ported from the design prototypes (project/dojo-motion.js).
// Grain, cursor, slash transition, marquee/parallax loop and toast live in components/Shell.tsx.
const E = "cubic-bezier(.7,0,.2,1)", OUT = "cubic-bezier(.16,1,.3,1)";
const FIELD = "input,textarea,select,[contenteditable=\"true\"]";

const calm = () => document.documentElement.hasAttribute("data-calm");
const reduced = () => calm() || matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "reduced";
const fine = () => matchMedia("(hover:hover) and (pointer:fine)").matches;
const editing = () => { const a = document.activeElement; return !!(a && a.matches && a.matches(FIELD)); };

let io: IntersectionObserver | undefined;
function count(el: HTMLElement) {
  const target = +el.dataset.count!; if (reduced()) return;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / 1300);
    el.textContent = Math.round(target * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p))).toLocaleString("en-IN");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function observe(root: Element) {
  if (!io) io = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target as HTMLElement; io!.unobserve(el);
    if (el.hasAttribute("data-count")) return count(el);
    if (el.hasAttribute("data-belt")) el.style.setProperty("--b", "1");
    if (!fine() && el.hasAttribute("data-tilt")) setTimeout(() => el.style.setProperty("--h", "1"), 450);
    if (el.style.opacity !== "0") return;
    const isCalm = !!el.closest('[data-calm="true"]');
    const sib = [...el.parentElement!.children].filter((c) => c.hasAttribute("data-reveal"));
    const i = Math.max(0, sib.indexOf(el)), red = reduced();
    el.style.opacity = "";
    el.animate(red ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translateY(${isCalm ? 24 : 48}px)` }, { opacity: 1, transform: "translateY(0)" }],
      { duration: red ? 300 : isCalm ? 900 : 620, delay: Math.min(i, 6) * (isCalm ? 110 : 70), easing: OUT, fill: "backwards" });
  }), { threshold: 0.12 });
  const vh = innerHeight;
  root.querySelectorAll("[data-reveal]").forEach((el: any) => { if (el._dx) return; el._dx = 1; if (el.getBoundingClientRect().top > vh * 0.95) el.style.opacity = "0"; io!.observe(el); });
  root.querySelectorAll("[data-count],[data-belt],[data-tilt]").forEach((el: any) => { if (el._dxc) return; el._dxc = 1; io!.observe(el); });
  if (!reduced()) root.querySelectorAll("[data-shine-bar]").forEach((el: any) => {
    if (el._dx) return; el._dx = 1;
    el.animate([{ transform: "translateX(-150%) skewX(-20deg)" }, { transform: "translateX(380%) skewX(-20deg)", offset: 0.22 }, { transform: "translateX(380%) skewX(-20deg)" }],
      { duration: 3800, delay: 1800, iterations: Infinity, easing: E });
  });
  root.querySelectorAll("[data-spin]").forEach((el: any) => { if (el._dx) return; el._dx = 1; el.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 700, iterations: Infinity }); });
}

function slam(root: Element, delay: number) {
  const ws = [...root.querySelectorAll("[data-slam]")].filter((w: any) => !w._dx), fs = [...root.querySelectorAll("[data-hero-fade]")].filter((w: any) => !w._dx);
  ws.forEach((w: any) => (w._dx = 1)); fs.forEach((w: any) => (w._dx = 1));
  const red = reduced(), isCalm = root.getAttribute("data-calm") === "true";
  ws.forEach((w: any, i) => w.animate(red ? [{ opacity: 0 }, { opacity: 1 }] : isCalm
    ? [{ opacity: 0, transform: "translateY(30px)", filter: "blur(6px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }]
    : [{ opacity: 0, transform: "scale(1.35)", filter: "blur(10px)" }, { opacity: 1, transform: "scale(.97)", filter: "blur(0px)", offset: 0.75 }, { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }],
    { duration: red ? 300 : isCalm ? 900 : 360, delay: delay + i * (isCalm ? 220 : 130), easing: isCalm ? OUT : E, fill: "backwards" }));
  const h1: any = root.querySelector("[data-shake]");
  if (h1 && !red && !isCalm && ws.length) h1.animate([{ transform: "none" }, { transform: "translate(-6px,3px)" }, { transform: "translate(5px,-2px)" }, { transform: "translate(-2px,1px)" }, { transform: "none" }], { duration: 260, delay: delay + (ws.length - 1) * 130 + 270 });
  fs.forEach((f: any, i) => f.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: red ? 300 : 500, delay: red ? 0 : delay + ws.length * (isCalm ? 220 : 130) + 80 + i * 70, easing: OUT, fill: "backwards" }));
}

export const DojoMotion = {
  E, OUT, editing, reduced,
  get fine() { return fine(); },
  init(root: Element | null) { if (!root) return; observe(root); slam(root, 120); },
  observe,
  go(href: string) { (window as any).__dxShell?.go(href); },
  toast(msg: string) { (window as any).__dxShell?.toast(msg); },
  pop(el: any) { if (!el || reduced() || editing()) return; el.animate([{ transform: "scale(1.16)" }, { transform: "scale(1)" }], { duration: 300, easing: E }); },
  stagger(els: any) { if (reduced()) return; [...els].forEach((el: any, i) => el.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: Math.min(i, 12) * 30, easing: OUT, fill: "backwards" })); },
  punch(el: any) { if (!el || reduced() || editing()) return; el.animate([{ transform: "scale(.4)", opacity: 0 }, { transform: "scale(1.15)", opacity: 1, offset: 0.6 }, { transform: "scale(1)" }], { duration: 320, easing: E }); },
  pulse(el: any) { if (!el || reduced() || editing()) return; el.animate([{ boxShadow: "0 0 0 0 rgba(200,16,46,.7)" }, { boxShadow: "0 0 0 18px rgba(200,16,46,0)" }], { duration: 500 }); },
  slideIn(el: any, from?: string) { if (!el || reduced()) return; el.animate(from === "bottom" ? [{ transform: "translateY(100%)" }, { transform: "none" }] : [{ opacity: 0, transform: "scale(.94) translateY(12px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: OUT }); },
};

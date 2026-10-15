"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { EASE, MOTION } from "@/lib/config";

type Ctx = { go: (href: string) => void; toast: (m: string) => void; reduced: () => boolean };
const ShellCtx = createContext<Ctx>({ go: () => {}, toast: () => {}, reduced: () => false });
export const useShell = () => useContext(ShellCtx);

const IN = "translateX(0) skewX(-18deg)", OUT = "translateX(130%) skewX(-18deg)", START = "translateX(-130%) skewX(-18deg)";

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const slashRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const introS = useRef<HTMLDivElement>(null);
  const introL = useRef<HTMLDivElement>(null);
  const scrollV = useRef(0);
  const pending = useRef(false);
  const [intro, setIntro] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [mobile, setMobile] = useState(false);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reduced = useCallback(
    () => MOTION.reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const toast = useCallback((m: string) => {
    setToastMsg(m); clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(""), 2400);
  }, []);

  const slashOut = useCallback(() => {
    const s = slashRef.current; if (!s || reduced()) return;
    s.style.transform = IN;
    s.animate([{ transform: IN }, { transform: OUT }], { duration: 380, delay: 80, easing: EASE, fill: "forwards" });
  }, [reduced]);

  const go = useCallback((href: string) => {
    const s = slashRef.current;
    const scrollTo = (id: string) => {
      const t = id.length > 1 ? document.querySelector(id) : null;
      const off = window.innerWidth < 1180 ? 64 : 76;
      window.scrollTo({ top: t ? t.getBoundingClientRect().top + window.scrollY - off : 0, behavior: "instant" as ScrollBehavior });
    };
    document.body.style.overflow = "";
    window.dispatchEvent(new Event("dx-close-menu"));
    if (href.startsWith("#")) {
      if (reduced() || !s) return scrollTo(href);
      s.animate([{ transform: START }, { transform: IN }], { duration: 260, easing: EASE, fill: "forwards" }).onfinish = () => {
        scrollTo(href);
        s.animate([{ transform: IN }, { transform: OUT }], { duration: 320, easing: EASE, fill: "forwards" });
      };
      return;
    }
    if (href.startsWith("/") && href.split(/[?#]/)[0] === path && href.includes("#")) return go(href.slice(href.indexOf("#")));
    if (reduced() || !s) return router.push(href);
    pending.current = true;
    s.animate([{ transform: START }, { transform: IN }], { duration: 260, easing: EASE, fill: "forwards" }).onfinish = () => router.push(href);
  }, [path, reduced, router]);

  // slash-out after a route change
  useEffect(() => { if (pending.current) { pending.current = false; slashOut(); } window.scrollTo(0, 0); }, [path, slashOut]);

  // one-time setup: grain, cursor, scroll velocity, resize
  useEffect(() => {
    setMobile(window.innerWidth < 768);
    const rs = () => setMobile(window.innerWidth < 768);
    let lastY = window.scrollY;
    const sc = () => { scrollV.current += Math.abs(window.scrollY - lastY); lastY = window.scrollY; };
    window.addEventListener("resize", rs); window.addEventListener("scroll", sc, { passive: true });

    let gi: ReturnType<typeof setInterval> | undefined;
    const g = grainRef.current;
    if (g && MOTION.grain) {
      const c = document.createElement("canvas"); c.width = c.height = 160;
      const x = c.getContext("2d")!, d = x.createImageData(160, 160);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); g.style.backgroundImage = `url(${c.toDataURL()})`; g.style.opacity = "0.06";
      if (!reduced()) gi = setInterval(() => { g.style.backgroundPosition = `${(Math.random() * 160) | 0}px ${(Math.random() * 160) | 0}px`; }, 90);
    }

    const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    let mm: ((e: MouseEvent) => void) | undefined;
    const m = { x: -100, y: -100, rx: -100, ry: -100, hit: false };
    if (fine && MOTION.cursor) {
      document.body.classList.add("kc-cursor");
      mm = (e) => {
        m.x = e.clientX; m.y = e.clientY;
        const dot = dotRef.current, ring = ringRef.current; if (!dot || !ring) return;
        dot.style.opacity = "1";
        const hit = !!(e.target as Element).closest?.("a,button,[data-tilt]");
        if (hit !== m.hit) {
          m.hit = hit; ring.style.width = ring.style.height = hit ? "44px" : "8px";
          ring.style.opacity = hit ? "1" : "0"; dot.style.opacity = hit ? "0" : "1";
        }
      };
      window.addEventListener("mousemove", mm);
    }

    // rAF loop: marquee, parallax, cursor easing
    const tracks = new Map<Element, number>();
    let boost = 0, raf = 0;
    const tick = () => {
      const red = reduced(), vh = window.innerHeight;
      boost = boost * 0.9 + scrollV.current * 0.08; scrollV.current = 0;
      document.querySelectorAll<HTMLElement>("[data-marquee]").forEach((el) => {
        let x = tracks.get(el) ?? 0; const dir = +(el.dataset.dir || 1), half = el.scrollWidth / 2;
        if (!red && half) { x -= dir * (0.7 + Math.min(boost, 18)); if (x <= -half) x += half; if (x > 0) x -= half; }
        tracks.set(el, x); el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      });
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        if (red) { el.style.translate = "0 0"; return; }
        const b = el.parentElement!.getBoundingClientRect();
        if (b.bottom < -200 || b.top > vh + 200) return;
        el.style.translate = `0 ${(-(b.top + b.height / 2 - vh / 2) * parseFloat(el.dataset.parallax!)).toFixed(1)}px`;
      });
      if (mm) {
        m.rx += (m.x - m.rx) * 0.22; m.ry += (m.y - m.ry) * 0.22;
        if (ringRef.current) ringRef.current.style.transform = `translate3d(${m.rx}px,${m.ry}px,0) translate(-50%,-50%)`;
        if (dotRef.current) dotRef.current.style.transform = `translate3d(${m.x}px,${m.y}px,0) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("resize", rs); window.removeEventListener("scroll", sc);
      if (mm) window.removeEventListener("mousemove", mm);
      cancelAnimationFrame(raf); clearInterval(gi); document.body.classList.remove("kc-cursor");
    };
  }, [reduced]);

  // hero slam
  const slam = useCallback(() => {
    const ws = [...document.querySelectorAll<HTMLElement>("[data-slam]")]; if (!ws.length) return;
    const fs = [...document.querySelectorAll<HTMLElement>("[data-hero-fade]")], red = reduced();
    ws.forEach((w, i) => w.animate(red ? [{ opacity: 0 }, { opacity: 1 }] : [
      { opacity: 0, transform: "scale(1.35)", filter: "blur(10px)" },
      { opacity: 1, transform: "scale(.97)", filter: "blur(0px)", offset: 0.75 },
      { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }],
      { duration: red ? 300 : 360, delay: i * 130, easing: EASE, fill: "backwards" }));
    const h1 = document.querySelector<HTMLElement>("[data-shake]");
    if (h1 && !red) h1.animate([{ transform: "none" }, { transform: "translate(-6px,3px)" }, { transform: "translate(5px,-2px)" }, { transform: "translate(-2px,1px)" }, { transform: "none" }],
      { duration: 260, delay: (ws.length - 1) * 130 + 270, easing: "linear" });
    fs.forEach((f, i) => f.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
      { duration: red ? 300 : 500, delay: red ? 0 : ws.length * 130 + 80 + i * 70, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
  }, [reduced]);

  // intro (first load of home only)
  const introDone = useRef(false);
  const introTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const endIntro = useCallback(() => {
    if (introDone.current) return; introDone.current = true;
    clearTimeout(introTimer.current); setIntro(false); requestAnimationFrame(slam);
  }, [slam]);
  const firstLoad = useRef(true);
  useEffect(() => {
    if (!firstLoad.current) return; firstLoad.current = false;
    if (path !== "/" || !MOTION.intro || reduced()) { introDone.current = true; slam(); return; }
    setIntro(true);
    requestAnimationFrame(() => {
      const o = introRef.current, s = introS.current, l = introL.current; if (!o || !s || !l) return endIntro();
      s.animate([{ transform: "translateX(-120%) skewX(-18deg)" }, { transform: IN }], { duration: 300, easing: EASE, fill: "forwards" });
      l.animate([{ opacity: 0, transform: "scale(1.6)", filter: "blur(8px)" }, { opacity: 1, transform: "scale(1)", filter: "blur(0px)" }], { duration: 280, delay: 200, easing: EASE, fill: "both" });
      introTimer.current = setTimeout(() => {
        s.animate([{ transform: IN }, { transform: OUT }], { duration: 320, easing: EASE, fill: "forwards" });
        l.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(.92)" }], { duration: 200, easing: EASE, fill: "forwards" });
        o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, delay: 160, fill: "forwards" }).onfinish = endIntro;
      }, 820);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // per-route effects: reveals, counters, shine; slam when returning to home
  useEffect(() => {
    if (path === "/" && introDone.current) slam();
    const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches, red = reduced(), vh = window.innerHeight;
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    els.forEach((el) => { if (el.getBoundingClientRect().top > vh * 0.95) el.style.opacity = "0"; });
    const count = (el: HTMLElement) => {
      const target = +el.dataset.count!; if (red) return;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(target * (p === 1 ? 1 : e)).toLocaleString("en-IN");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement; io.unobserve(el);
      if (el.hasAttribute("data-count")) return count(el);
      if (el.style.opacity !== "0") return;
      const sib = [...el.parentElement!.children].filter((c) => c.hasAttribute("data-reveal"));
      const i = Math.max(0, sib.indexOf(el)); el.style.opacity = "";
      el.animate(red ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: "translateY(48px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: red ? 300 : 620, delay: Math.min(i, 6) * 70, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
    }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => io.observe(el));
    void fine;
    if (!red) document.querySelectorAll<HTMLElement>("[data-shine]").forEach((el) => el.animate([
      { transform: "translateX(-150%) skewX(-20deg)" }, { transform: "translateX(380%) skewX(-20deg)", offset: 0.22 }, { transform: "translateX(380%) skewX(-20deg)" }],
      { duration: 3800, delay: 2200, iterations: Infinity, easing: EASE }));
    return () => io.disconnect();
  }, [path, reduced, slam]);

  return (
    <ShellCtx.Provider value={{ go, toast, reduced }}>
      <div className="root">
        {intro && (
          <div ref={introRef} className="intro" onClick={endIntro}>
            <div ref={introS} className="s" />
            <div ref={introL} className="l">
              <div className="anton" style={{ fontSize: "clamp(64px,14vw,180px)", lineHeight: 0.9, letterSpacing: ".04em", color: "var(--fg)" }}>DOJO X</div>
              <div className="mono" style={{ fontSize: 12, letterSpacing: ".5em", color: "var(--fg)" }}>FIGHT ACADEMY · EST. 2013</div>
            </div>
            <button className="skip" onClick={endIntro}>SKIP INTRO →</button>
          </div>
        )}
        <div ref={slashRef} className="slash" style={{ transform: START }} />
        <div ref={grainRef} className="grain" aria-hidden="true" />
        {children}
        <div role="status" aria-live="polite" className="toast"
          style={{ bottom: mobile ? 96 : 28, transform: `translateX(-50%) translateY(${toastMsg ? 0 : 16}px)`, opacity: toastMsg ? 1 : 0, transition: `transform .3s ${EASE},opacity .2s` }}>
          <span style={{ width: 8, height: 8, background: "var(--red)", transform: "rotate(45deg)" }} />{toastMsg}
        </div>
        <div ref={ringRef} className="ring" aria-hidden="true" />
        <div ref={dotRef} className="dot" aria-hidden="true" />
      </div>
    </ShellCtx.Provider>
  );
}

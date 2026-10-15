(function () {
  if (window.DojoMotion) return;
  const E = 'cubic-bezier(.7,0,.2,1)', OUT = 'cubic-bezier(.16,1,.3,1)', SK = ' skewX(-18deg)';
  const calm = () => document.documentElement.hasAttribute('data-calm');
  const reduced = () => calm() || matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-motion') === 'reduced';
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const FIELD = 'input,textarea,select,[contenteditable="true"]';
  const editing = () => { const a = document.activeElement; return !!(a && a.matches && a.matches(FIELD)); };

  function slashEl() {
    let s = document.getElementById('dx-slash');
    if (!s) {
      s = document.createElement('div'); s.id = 'dx-slash'; s.setAttribute('aria-hidden', 'true');
      s.style.cssText = 'position:fixed;top:-10%;bottom:-10%;left:-30%;width:160%;z-index:95;background:#C8102E;transform:translateX(-130%)' + SK + ';pointer-events:none';
      document.body.appendChild(s);
    }
    return s;
  }
  let entering = false;
  try { if (sessionStorage.getItem('dx-enter') === '1') { sessionStorage.removeItem('dx-enter'); entering = !reduced(); } } catch (e) {}
  const whenBody = fn => document.body ? fn() : document.addEventListener('DOMContentLoaded', fn);
  if (entering) whenBody(() => { slashEl().style.transform = 'translateX(0)' + SK; });
  function exitSlash() {
    if (!entering) return; entering = false;
    slashEl().animate([{ transform: 'translateX(0)' + SK }, { transform: 'translateX(130%)' + SK }], { duration: 380, easing: E, fill: 'forwards' });
  }
  setTimeout(exitSlash, 1600);
  window.addEventListener('pageshow', e => { if (e.persisted) { const s = document.getElementById('dx-slash'); if (s) { s.getAnimations().forEach(a => a.cancel()); s.style.transform = 'translateX(-130%)' + SK; } } });

  function go(href) {
    if (reduced()) { location.href = href; return; }
    const a = slashEl().animate([{ transform: 'translateX(-130%)' + SK }, { transform: 'translateX(0)' + SK }], { duration: 260, easing: E, fill: 'forwards' });
    a.onfinish = () => { try { sessionStorage.setItem('dx-enter', '1'); } catch (e) {} location.href = href; };
  }

  function toast(msg) {
    let t = document.getElementById('dx-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'dx-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
      t.style.cssText = 'position:fixed;left:50%;z-index:96;transform:translateX(-50%) translateY(16px);opacity:0;transition:transform .3s ' + E + ',opacity .2s;pointer-events:none;display:flex;align-items:center;gap:12px;padding:14px 18px;background:#1A1A1A;border:1px solid #2E2E2E;box-shadow:0 12px 32px rgba(0,0,0,.5);font:600 14px/1.35 Manrope,sans-serif;color:#F5F5F5;max-width:calc(100vw - 32px)';
      document.body.appendChild(t);
    }
    t.innerHTML = '<span style="flex:none;width:8px;height:8px;background:#C8102E;transform:rotate(45deg)"></span>';
    t.appendChild(document.createTextNode(msg));
    t.style.bottom = innerWidth < 768 ? '96px' : '28px';
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(16px)'; }, 2600);
  }

  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const tEl = e.target.closest && e.target.closest('[data-toast]');
    if (tEl) { e.preventDefault(); toast(tEl.getAttribute('data-toast')); return; }
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!/\.dc\.html(\?|#|$)/.test(href)) return;
    e.preventDefault(); go(href);
  });

  // grain + cursor (global, once)
  let ring, dot, mx = -100, my = -100, rx = -100, ry = -100, hit = false;
  whenBody(() => {
    if (calm()) return;
    const g = document.createElement('div'); g.setAttribute('aria-hidden', 'true');
    g.style.cssText = 'position:fixed;inset:0;z-index:80;pointer-events:none;opacity:.06';
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const x = c.getContext('2d'), d = x.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); g.style.backgroundImage = `url(${c.toDataURL()})`;
    document.body.appendChild(g);
    document.addEventListener('focusin', e => { if (e.target.matches && e.target.matches(FIELD)) { g.style.opacity = '0'; document.body.classList.remove('kc-cursor'); if (ring) { ring.style.opacity = '0'; dot.style.opacity = '0'; } } });
    document.addEventListener('focusout', () => setTimeout(() => { if (!editing()) { g.style.opacity = '.06'; if (fine) document.body.classList.add('kc-cursor'); } }, 0));
    if (!reduced()) setInterval(() => { if (editing()) return; g.style.backgroundPosition = `${(Math.random() * 160) | 0}px ${(Math.random() * 160) | 0}px`; }, 90);
    if (fine) {
      document.body.classList.add('kc-cursor');
      ring = document.createElement('div'); dot = document.createElement('div');
      ring.style.cssText = 'position:fixed;left:0;top:0;z-index:400;width:8px;height:8px;border:1.5px solid #C8102E;border-radius:50%;opacity:0;pointer-events:none;transition:width .2s ' + E + ',height .2s ' + E + ',opacity .2s';
      dot.style.cssText = 'position:fixed;left:0;top:0;z-index:401;width:8px;height:8px;background:#C8102E;border-radius:50%;opacity:0;pointer-events:none;transition:opacity .2s';
      document.body.appendChild(ring); document.body.appendChild(dot);
      window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        if (editing() || (e.target.closest && e.target.closest(FIELD))) { ring.style.opacity = '0'; dot.style.opacity = '0'; hit = false; return; }
        const h = !!(e.target.closest && e.target.closest('a,button,[data-tilt],image-slot,label,[role=button]'));
        if (h !== hit || dot.style.opacity === '0' && !h) { hit = h; ring.style.width = ring.style.height = h ? '44px' : '8px'; ring.style.opacity = h ? '1' : '0'; dot.style.opacity = h ? '0' : '1'; }
        const tl = e.target.closest && e.target.closest('[data-tilt]');
        if (tl && !reduced()) { const r = tl.getBoundingClientRect(); tl.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 9).toFixed(2) + 'deg'); tl.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 7).toFixed(2) + 'deg'); tl._t = 1; }
        document.querySelectorAll('[data-tilt]').forEach(el => { if (el !== tl && el._t) { el._t = 0; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); } });
      });
      document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
      document.addEventListener('mouseover', e => { const f = !!(e.target.closest && e.target.closest(FIELD)); if (f || editing()) { document.body.classList.remove('kc-cursor'); ring.style.opacity = '0'; dot.style.opacity = '0'; } else if (!document.body.classList.contains('kc-cursor')) document.body.classList.add('kc-cursor'); });
    }
  });

  // loop: marquee + parallax + cursor
  const tracks = [], pars = [];
  let scrollV = 0, lastY = 0, boost = 0;
  window.addEventListener('scroll', () => { const y = scrollY; scrollV += Math.abs(y - lastY); lastY = y; }, { passive: true });
  function tick() {
    const red = reduced(), vh = innerHeight;
    boost = boost * 0.9 + scrollV * 0.08; scrollV = 0;
    for (const t of tracks) {
      if (!t.el.isConnected) continue;
      const half = t.el.scrollWidth / 2;
      if (!red && half) { t.x -= t.dir * (0.7 + Math.min(boost, 18)); if (t.x <= -half) t.x += half; if (t.x > 0) t.x -= half; }
      t.el.style.transform = `translate3d(${t.x.toFixed(1)}px,0,0)`;
    }
    for (const el of pars) {
      if (!el.isConnected) continue;
      if (red) { el.style.translate = '0 0'; continue; }
      const b = el.parentElement.getBoundingClientRect();
      if (b.bottom < -200 || b.top > vh + 200) continue;
      el.style.translate = `0 ${(-(b.top + b.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
    }
    if (ring) {
      rx += (mx - rx) * 0.22; ry += (my - ry) * 0.22;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function count(el) {
    const target = +el.dataset.count; if (reduced()) return;
    const t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 1300); el.textContent = Math.round(target * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p))).toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  let io;
  function observe(root) {
    if (!io) io = new IntersectionObserver(ents => ents.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; io.unobserve(el);
      if (el.hasAttribute('data-count')) return count(el);
      if (el.hasAttribute('data-belt')) { el.style.setProperty('--b', '1'); }
      if (!fine && el.hasAttribute('data-tilt')) setTimeout(() => el.style.setProperty('--h', '1'), 450);
      if (el.style.opacity !== '0') return;
      const calm = !!el.closest('[data-calm="true"]');
      const sib = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      const i = Math.max(0, sib.indexOf(el)), red = reduced();
      el.style.opacity = '';
      el.animate(red ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translateY(${calm ? 24 : 48}px)` }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: red ? 300 : calm ? 900 : 620, delay: Math.min(i, 6) * (calm ? 110 : 70), easing: OUT, fill: 'backwards' });
    }), { threshold: 0.12 });
    const vh = innerHeight;
    root.querySelectorAll('[data-reveal]').forEach(el => { if (el._dx) return; el._dx = 1; if (el.getBoundingClientRect().top > vh * 0.95) el.style.opacity = '0'; io.observe(el); });
    root.querySelectorAll('[data-count],[data-belt],[data-tilt]').forEach(el => { if (el._dxc) return; el._dxc = 1; io.observe(el); });
    root.querySelectorAll('[data-marquee]').forEach(el => { if (el._dx) return; el._dx = 1; tracks.push({ el, x: 0, dir: +el.dataset.dir || 1 }); });
    root.querySelectorAll('[data-parallax]').forEach(el => { if (el._dx) return; el._dx = 1; pars.push(el); });
    if (!reduced()) root.querySelectorAll('[data-shine-bar]').forEach(el => { if (el._dx) return; el._dx = 1; el.animate([{ transform: 'translateX(-150%) skewX(-20deg)' }, { transform: 'translateX(380%) skewX(-20deg)', offset: 0.22 }, { transform: 'translateX(380%) skewX(-20deg)' }], { duration: 3800, delay: 1800, iterations: Infinity, easing: E }); });
    root.querySelectorAll('[data-spin]').forEach(el => { if (el._dx) return; el._dx = 1; el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 700, iterations: Infinity }); });
  }

  function slam(root, delay) {
    const ws = [...root.querySelectorAll('[data-slam]')].filter(w => !w._dx), fs = [...root.querySelectorAll('[data-hero-fade]')].filter(w => !w._dx);
    ws.forEach(w => w._dx = 1); fs.forEach(w => w._dx = 1);
    const red = reduced(), calm = root.getAttribute('data-calm') === 'true';
    ws.forEach((w, i) => w.animate(red ? [{ opacity: 0 }, { opacity: 1 }] : calm
      ? [{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }]
      : [{ opacity: 0, transform: 'scale(1.35)', filter: 'blur(10px)' }, { opacity: 1, transform: 'scale(.97)', filter: 'blur(0px)', offset: 0.75 }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }],
      { duration: red ? 300 : calm ? 900 : 360, delay: delay + i * (calm ? 220 : 130), easing: calm ? OUT : E, fill: 'backwards' }));
    const h1 = root.querySelector('[data-shake]');
    if (h1 && !red && !calm && ws.length) h1.animate([{ transform: 'none' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-2px)' }, { transform: 'translate(-2px,1px)' }, { transform: 'none' }], { duration: 260, delay: delay + (ws.length - 1) * 130 + 270 });
    fs.forEach((f, i) => f.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: red ? 300 : 500, delay: red ? 0 : delay + ws.length * (calm ? 220 : 130) + 80 + i * 70, easing: OUT, fill: 'backwards' }));
  }

  function init(root) {
    if (!root) return;
    const wasEntering = entering;
    exitSlash();
    observe(root);
    slam(root, wasEntering ? 220 : 60);
  }

  function pop(el) { if (!el || reduced() || editing()) return; el.animate([{ transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 300, easing: E }); }
  function stagger(els) { if (reduced()) return; [...els].forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: Math.min(i, 12) * 30, easing: OUT, fill: 'backwards' })); }
  function punch(el) { if (!el || reduced() || editing()) return; el.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: .6 }, { transform: 'scale(1)' }], { duration: 320, easing: E }); }
  function pulse(el) { if (!el || reduced() || editing()) return; el.animate([{ boxShadow: '0 0 0 0 rgba(200,16,46,.7)' }, { boxShadow: '0 0 0 18px rgba(200,16,46,0)' }], { duration: 500 }); }
  function slideIn(el, from) { if (!el || reduced()) return; el.animate(from === 'bottom' ? [{ transform: 'translateY(100%)' }, { transform: 'none' }] : [{ opacity: 0, transform: 'scale(.94) translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: OUT }); }

  window.DojoMotion = { editing, init, observe, go, toast, pop, stagger, punch, pulse, slideIn, reduced, fine, E, OUT };
  window.DojoReady = cb => { const t = () => window.DojoMotion && window.DOJO ? cb() : setTimeout(t, 30); t(); };
})();

import type { CSSProperties } from "react";

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function splitDecls(css: string): string[] {
  const out: string[] = []; let depth = 0, q = "", cur = "";
  for (const ch of css) {
    if (q) { if (ch === q) q = ""; }
    else if (ch === '"' || ch === "'") q = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === ";" && !depth && !q) { out.push(cur); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

/** Parse an inline-style string (as used in the design prototypes) into a React style object. */
export function css(s: string): CSSProperties {
  const o: Record<string, string> = {};
  for (const d of splitDecls(s || "")) {
    const i = d.indexOf(":"); if (i < 0) continue;
    const p = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
    if (!p) continue;
    o[p.startsWith("--") ? p : camel(p.replace(/^-ms-/, "ms-"))] = v;
  }
  return o as CSSProperties;
}

let sheet: CSSStyleSheet | null = null;
const cache = new Map<string, string>();
let n = 0;
/** Pseudo-class style (hover / active / focus ...) as a generated class, like the prototype's `style-hover` attribute. */
export function pc(pseudo: string, body: string): string {
  const k = pseudo + "|" + body, hit = cache.get(k); if (hit) return hit;
  if (!sheet) { const el = document.createElement("style"); document.head.appendChild(el); sheet = el.sheet!; }
  const cls = "scp" + (n++).toString(36);
  const el = pseudo === "before" || pseudo === "after";
  const decl = el ? body : splitDecls(body).map((d) => (/!important/.test(d) ? d : d.trim() + " !important")).join(";");
  sheet.insertRule(`.${cls}${el ? "::" : ":"}${pseudo}{${decl}}`, sheet.cssRules.length);
  cache.set(k, cls);
  return cls;
}

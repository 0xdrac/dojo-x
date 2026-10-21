/**
 * Page screens load as separate chunks. Fetch them ahead of time so tapping a link shows the next page straight away:
 * the main ones when the browser is idle after the first page, and any page as soon as a finger or pointer reaches its link.
 */
const SCREENS: Record<string, () => Promise<unknown>> = {
  "/programs": () => import("@/screens/Programs"), "/schedule": () => import("@/screens/Schedule"), "/pricing": () => import("@/screens/Pricing"),
  "/coaches": () => import("@/screens/Coaches"), "/about": () => import("@/screens/About"), "/free-trial": () => import("@/screens/FreeTrial"),
  "/discipline": () => import("@/screens/Discipline"), "/faqs": () => import("@/screens/FAQs"), "/blog": () => import("@/screens/Blog"),
  "/article": () => import("@/screens/Article"), "/gallery": () => import("@/screens/Gallery"), "/contact": () => import("@/screens/Contact"),
  "/checkout": () => import("@/screens/Checkout"), "/member-portal": () => import("@/screens/MemberPortal"), "/login": () => import("@/components/EmailLogin"),
};
const done = new Set<string>();
export function warm(href: string, prefetch?: (p: string) => void) {
  const path = href.split(/[?#]/)[0];
  if (done.has(path)) return; done.add(path);
  try { prefetch?.(path); } catch {}
  SCREENS[path]?.().catch(() => done.delete(path));
}
/** On a slow or data-saver connection only warm what the visitor points at. */
export function warmCommon(prefetch?: (p: string) => void) {
  const c = (navigator as any).connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
  ["/programs", "/schedule", "/pricing", "/free-trial", "/coaches", "/discipline", "/login"].forEach((p, i) => setTimeout(() => warm(p, prefetch), i * 150));
}

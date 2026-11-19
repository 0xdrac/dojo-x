"use client";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Vercel Web Analytics: page views for the public site and member pages. Staff tools aren't counted, and order ids never leave the browser. */
export default function SiteAnalytics() {
  const beforeSend = (e: BeforeSendEvent) => {
    const u = new URL(e.url);
    if (/^\/(admin|coach-app|staff-login)/.test(u.pathname)) return null;
    if (/^\/(invoice|checkout)/.test(u.pathname)) { u.search = ""; return { ...e, url: u.toString() }; }
    return e;
  };
  return <Analytics beforeSend={beforeSend} />;
}

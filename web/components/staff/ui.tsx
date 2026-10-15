"use client";
import { useEffect, useState } from "react";
import { DojoAPI, call } from "@/lib/api";
import DOJO from "@/lib/dojo";

export const D: any = DOJO;
export const hueColor = (disc: string) => D.color(disc);
export const time12 = (t: string) => D.time12(t);
export const coachName = (k: string) => D.coaches[k]?.first ?? k;
export const DAYS: string[] = D.days;
export const DAYS_LONG: string[] = D.daysLong;
export const initials = (n: string) => n.split(" ").filter(Boolean).map((x) => x[0]).join("").slice(0, 2).toUpperCase();

/** Local calendar date as YYYY-MM-DD. */
export const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** 0 = Monday ... 6 = Sunday */
export const wd = (d = new Date()) => (d.getDay() + 6) % 7;
/** Next calendar date (today included) that falls on weekday `day`. */
export function nextDateFor(day: number): string {
  const d = new Date(); d.setDate(d.getDate() + ((day - wd(d) + 7) % 7)); return ymd(d);
}
export const fmtDay = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const fmtWhen = (iso: string) => new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
export const toLocalInput = (iso: string) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="st-ov" onClick={onClose}>
      <div className="st-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          <h2 className="anton" style={{ margin: 0, fontSize: 30, lineHeight: 1, color: "var(--fg)" }}>{title}</h2>
          <button className="st-btn sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="st-fg" style={{ display: "block" }}><span className="st-lb">{label}</span>{children}</label>
);
export function Chips<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return <div className="st-chips">{options.map(([k, l]) => <button type="button" key={String(k)} className={"st-chip" + (value === k ? " on" : "")} onClick={() => onChange(k)}>{l}</button>)}</div>;
}

/** Load once, with a reload() and a loading flag. */
export function useLoad<T>(fn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true; setLoading(true);
    fn().then((d) => { if (live) { setData(d); setLoading(false); } });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return { data, loading, reload: () => setN((x) => x + 1), set: setData };
}

export const api = DojoAPI;
export const http = call;

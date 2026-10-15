"use client";
import { useEffect, useState } from "react";
import { loadPublic } from "@/lib/api";
import DOJO from "@/lib/dojo";

const FALLBACK = "MUAY THAI FUNDAMENTALS · 6:30 PM · COACH KAVYA";

/** Home hero ticker: the next class on the live weekly timetable. */
export default function NextUp() {
  const [text, setText] = useState(FALLBACK);
  useEffect(() => {
    loadPublic().then(() => {
      const D: any = DOJO, now = new Date(), day = (now.getDay() + 6) % 7, mins = now.getHours() * 60 + now.getMinutes();
      let best: any = null, bestGap = Infinity;
      for (const c of D.classes as any[]) {
        const [h, m] = c.t.split(":").map(Number);
        let gap = ((c.d - day + 7) % 7) * 1440 + (h * 60 + m - mins);
        if (gap < 0) gap += 7 * 1440;
        if (gap < bestGap) { bestGap = gap; best = c; }
      }
      if (!best) return;
      const when = best.d === day && bestGap < 1440 ? "TODAY" : bestGap < 2880 && (best.d - day + 7) % 7 === 1 ? "TOMORROW" : D.daysLong[best.d].toUpperCase();
      setText(`${best.title.toUpperCase()} · ${when} ${D.time12(best.t)} · COACH ${(D.coaches[best.coach]?.first ?? best.coach).toUpperCase()}`);
    });
  }, []);
  return <>{text}</>;
}

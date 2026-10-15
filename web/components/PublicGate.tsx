"use client";
import { useEffect, useState } from "react";
import { loadPublic } from "@/lib/api";

/** Holds a screen back until the live timetable / coupons / events are loaded into the prototype's data objects. */
export default function PublicGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { loadPublic().finally(() => setReady(true)); }, []);
  return ready ? <>{children}</> : null;
}

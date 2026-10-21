import { store } from "./store";
import { getSession } from "./session";
import { fail } from "./util";
import type { Staff } from "./types";

type Role = Staff["role"];
/** Resolves the signed-in staff member, or a ready-made 401/403 response. */
export async function staffGuard(roles?: Role[]): Promise<{ staff: Staff } | { res: Response }> {
  const sess = await getSession("staff");
  const staff = sess ? await store().staffById(sess.sub) : null;
  if (!staff) return { res: fail("Staff only", 401) };
  if (roles && !roles.includes(staff.role)) return { res: fail("Your role can’t do that", 403) };
  return { staff };
}
export const isRes = (g: any): g is { res: Response } => "res" in g;

/** Today's calendar date in India (IST), as YYYY-MM-DD. */
export const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
export const isDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
/** 0 = Monday ... 6 = Sunday for a YYYY-MM-DD date (calendar date, no timezone shift). */
export const weekday = (d: string) => (new Date(d + "T12:00:00Z").getUTCDay() + 6) % 7;

/** Current time in India: today's date and minutes since midnight. */
export const istNow = () => { const d = new Date(Date.now() + 5.5 * 3600e3); return { date: d.toISOString().slice(0, 10), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() }; };

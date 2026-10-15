import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Session = { sub: string; kind: "member" | "staff"; exp: number };
const NAME = "dx_session";
const DAYS = 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required in production");
  return "dev-only-secret-change-me";
}
const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function encode(s: Omit<Session, "exp">): string {
  const body = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + DAYS * 864e5 })).toString("base64url");
  return `${body}.${sign(body)}`;
}
export function decode(token?: string | null): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const want = sign(body);
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try { const s = JSON.parse(Buffer.from(body, "base64url").toString()) as Session; return s.exp > Date.now() ? s : null; } catch { return null; }
}
export async function getSession(kind?: Session["kind"]): Promise<Session | null> {
  const s = decode((await cookies()).get(NAME)?.value);
  return s && (!kind || s.kind === kind) ? s : null;
}
export async function setSession(s: Omit<Session, "exp">) {
  (await cookies()).set(NAME, encode(s), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: DAYS * 86400 });
}
export async function clearSession() { (await cookies()).delete(NAME); }

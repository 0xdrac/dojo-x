import { NextResponse } from "next/server";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
export const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "").slice(-10);
export const validPhone = (p: string) => /^[6-9]\d{9}$/.test(p) || /^9000000\d{3}$/.test(p);
export const str = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
export async function body<T = any>(req: Request): Promise<T> { try { return (await req.json()) as T; } catch { return {} as T; } }

/** Demo OTP: any 6 digits are accepted, except 000000 (so the error state can be shown). Real OTP replaces this check. */
export function checkOtp(code: unknown): { ok: boolean; error?: string } {
  if (process.env.DEMO_OTP === "0") return { ok: false, error: "OTP delivery is not configured yet." };
  const c = String(code ?? "");
  if (!/^\d{6}$/.test(c)) return { ok: false, error: "Enter all 6 digits." };
  if (c === "000000") return { ok: false, error: "That code doesn’t match. 2 attempts left." };
  return { ok: true };
}

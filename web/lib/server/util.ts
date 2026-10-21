import { NextResponse } from "next/server";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
export const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "").slice(-10);
export const validPhone = (p: string) => /^[6-9]\d{9}$/.test(p) || /^9000000\d{3}$/.test(p);
export const str = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);
export async function body<T = any>(req: Request): Promise<T> { try { return (await req.json()) as T; } catch { return {} as T; } }


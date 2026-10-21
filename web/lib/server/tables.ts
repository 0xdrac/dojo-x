import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { usingSupabase } from "./store";

const needSupabase = () => { if (process.env.NODE_ENV === "production" && !usingSupabase()) throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."); };

/**
 * Generic row access for the schedule/events/coupons/attendance tables (snake_case columns, same names in both backends).
 * Supabase when configured, otherwise a local JSON file (.data/tables.json, dev only).
 */
export type Row = Record<string, any>;
type Eq = Record<string, any>;
type ListOpts = { eq?: Eq; order?: [string, boolean?]; gte?: [string, any]; lte?: [string, any]; limit?: number; in?: [string, any[]] };

const FILE = path.join(process.cwd(), ".data", "tables.json");
const load = (): Record<string, Row[]> => { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } };
const save = (db: Record<string, Row[]>) => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); };
const match = (r: Row, eq?: Eq) => !eq || Object.entries(eq).every(([k, v]) => r[k] === v);
let _sb: any = null;
const sb = (): any => (_sb ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } }));
const must = (r: { data: any; error: { message: string } | null }): any => { if (r.error) throw new Error(r.error.message); return r.data; };

export const T = {
  async list(table: string, o: ListOpts = {}): Promise<Row[]> {
    needSupabase();
    if (usingSupabase()) {
      let q = sb().from(table).select("*");
      for (const [k, v] of Object.entries(o.eq ?? {})) q = q.eq(k, v);
      if (o.gte) q = q.gte(o.gte[0], o.gte[1]);
      if (o.lte) q = q.lte(o.lte[0], o.lte[1]);
      if (o.order) q = q.order(o.order[0], { ascending: o.order[1] !== false });
      if (o.in) q = q.in(o.in[0], o.in[1]);
      if (o.limit) q = q.limit(o.limit);
      return must(await q);
    }
    let rows = (load()[table] ?? []).filter((r) => match(r, o.eq));
    if (o.in) rows = rows.filter((r) => o.in![1].includes(r[o.in![0]]));
    if (o.gte) rows = rows.filter((r) => r[o.gte![0]] >= o.gte![1]);
    if (o.lte) rows = rows.filter((r) => r[o.lte![0]] <= o.lte![1]);
    if (o.order) { const [c, asc] = o.order; rows = rows.slice().sort((a, b) => (a[c] < b[c] ? -1 : a[c] > b[c] ? 1 : 0) * (asc === false ? -1 : 1)); }
    return o.limit ? rows.slice(0, o.limit) : rows;
  },
  async get(table: string, eq: Eq): Promise<Row | null> { return (await T.list(table, { eq, limit: 1 }))[0] ?? null; },
  async insert(table: string, row: Row): Promise<Row> {
    needSupabase();
    if (usingSupabase()) return must(await sb().from(table).insert(row).select().single());
    const db = load(); const r = { id: row.id ?? randomUUID(), created_at: new Date().toISOString(), ...row }; (db[table] ??= []).push(r); save(db); return r;
  },
  async update(table: string, eq: Eq, patch: Row): Promise<Row | null> {
    needSupabase();
    if (usingSupabase()) {
      let q = sb().from(table).update(patch); for (const [k, v] of Object.entries(eq)) q = q.eq(k, v);
      return must(await q.select()).at(0) ?? null;
    }
    const db = load(); const r = (db[table] ?? []).find((x) => match(x, eq)); if (!r) return null; Object.assign(r, patch); save(db); return r;
  },
  async delete(table: string, eq: Eq): Promise<number> {
    needSupabase();
    if (usingSupabase()) { let q = sb().from(table).delete(); for (const [k, v] of Object.entries(eq)) q = q.eq(k, v); return must(await q.select()).length; }
    const db = load(); const n = (db[table] ?? []).length; db[table] = (db[table] ?? []).filter((r) => !match(r, eq)); save(db); return n - db[table].length;
  },
  /** Insert, or update the row that matches `eq` (used where a unique key prevents duplicates). */
  async upsert(table: string, eq: Eq, row: Row): Promise<Row> {
    const hit = await T.get(table, eq);
    return hit ? (await T.update(table, eq, row))! : T.insert(table, { ...eq, ...row });
  },
};

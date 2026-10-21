import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Account, Member, Staff, Store, Trial } from "./types";

type DB = { accounts: Account[]; members: Member[]; trials: Trial[]; staff: Staff[]; seq: number };
const FILE = path.join(process.cwd(), ".data", "dojo.json");

const SEED_STAFF: Staff[] = [
  { id: "staff-owner", phone: "9000000001", name: "Owner", role: "owner", coachKey: "aman" },
  { id: "staff-coach", phone: "9000000002", name: "Vishal", role: "coach", coachKey: "vishal" },
  { id: "staff-desk", phone: "9000000003", name: "Front Desk", role: "frontdesk" },
];

function load(): DB {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return { accounts: [], members: [], trials: [], staff: SEED_STAFF, seq: 0 }; }
}
function save(db: DB) { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }
const now = () => new Date().toISOString();
const code = (db: DB) => `DX-${String(new Date().getFullYear()).slice(2)}-${String(++db.seq).padStart(4, "0")}`;

/** Dev-only JSON-file store, used when Supabase keys are not configured. */
export const fileStore: Store = {
  async accountByPhone(phone) { return load().accounts.find((a) => a.phone === phone) ?? null; },
  async accountById(id) { return load().accounts.find((a) => a.id === id) ?? null; },
  async createAccount(phone) { const db = load(); const a = { id: randomUUID(), phone, createdAt: now() }; db.accounts.push(a); save(db); return a; },
  async members(accountId) { return load().members.filter((m) => m.accountId === accountId); },
  async allMembers() { const db = load(); return db.members.map((m) => ({ ...m, phone: db.accounts.find((a) => a.id === m.accountId)?.phone ?? "" })); },
  async addMember(m) { const db = load(); const r: Member = { ...m, id: randomUUID(), memberCode: code(db), createdAt: now() }; db.members.push(r); save(db); return r; },
  async updateMember(accountId, id, patch) {
    const db = load(); const m = db.members.find((x) => x.id === id && x.accountId === accountId); if (!m) return null;
    Object.assign(m, patch); save(db); return m;
  },
  async deleteMember(accountId, id) { const db = load(); const n = db.members.length; db.members = db.members.filter((x) => !(x.id === id && x.accountId === accountId)); save(db); return db.members.length < n; },
  async addTrial(t) { const db = load(); const r: Trial = { ...t, id: randomUUID(), status: "booked", createdAt: now() }; db.trials.push(r); save(db); return r; },
  async trials() { return load().trials.slice().reverse(); },
  async setTrialStatus(id, status) { const db = load(); const t = db.trials.find((x) => x.id === id); if (!t) return null; t.status = status; save(db); return t; },
  async staffByPhone(phone) { const db = load(); return (db.staff?.length ? db.staff : SEED_STAFF).find((s) => s.phone === phone) ?? null; },
  async staffById(id) { const db = load(); return (db.staff?.length ? db.staff : SEED_STAFF).find((s) => s.id === id) ?? null; },
};

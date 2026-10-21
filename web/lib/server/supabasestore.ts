import { createClient } from "@supabase/supabase-js";
import type { Account, Member, Staff, Store, Trial } from "./types";

const sb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const must = <T,>(r: { data: T | null; error: { message: string } | null }): T => { if (r.error) throw new Error(r.error.message); return r.data as T; };

const toAccount = (r: any): Account => ({ id: r.id, phone: r.phone, createdAt: r.created_at });
const toMember = (r: any): Member => ({ id: r.id, accountId: r.account_id, rel: r.rel, name: r.name, dob: r.dob, email: r.email, gender: r.gender, memberCode: r.member_code, emergency: r.emergency, waiver: r.waiver, createdAt: r.created_at });
const toTrial = (r: any): Trial => ({ id: r.id, accountId: r.account_id, name: r.name, phone: r.phone, email: r.email, discipline: r.discipline, ageGroup: r.age_group, experience: r.experience, slot: r.slot, status: r.status, createdAt: r.created_at });
const toStaff = (r: any): Staff => ({ id: r.id, phone: r.phone, name: r.name, role: r.role, coachKey: r.coach_key });

export const supabaseStore: Store = {
  async accountByPhone(phone) { const r = await sb().from("accounts").select("*").eq("phone", phone).maybeSingle(); return r.data ? toAccount(must(r)) : null; },
  async accountById(id) { const r = await sb().from("accounts").select("*").eq("id", id).maybeSingle(); return r.data ? toAccount(must(r)) : null; },
  async setAccountPhone(id, phone) { const r = await sb().from("accounts").update({ phone }).eq("id", id).select().maybeSingle(); return r.data ? toAccount(must(r)) : null; },
  async createAccount(phone) { return toAccount(must(await sb().from("accounts").insert({ phone }).select().single())); },
  async members(accountId) { return must(await sb().from("members").select("*").eq("account_id", accountId).order("created_at")).map(toMember); },
  async allMembers() {
    const rows = must(await sb().from("members").select("*, accounts(phone)").order("created_at", { ascending: false })) as any[];
    return rows.map((r) => ({ ...toMember(r), phone: r.accounts?.phone ?? "" }));
  },
  async addMember(m) {
    return toMember(must(await sb().from("members").insert({ account_id: m.accountId, rel: m.rel, name: m.name, dob: m.dob || null, email: m.email || null, gender: m.gender || null, emergency: m.emergency ?? null, waiver: m.waiver ?? null }).select().single()));
  },
  async updateMember(accountId, id, p) {
    const patch: any = {};
    for (const k of ["rel", "name", "dob", "email", "gender", "emergency", "waiver"] as const) if (k in p) patch[k] = (p as any)[k] === "" ? null : (p as any)[k];
    const r = await sb().from("members").update(patch).eq("id", id).eq("account_id", accountId).select().maybeSingle();
    return r.data ? toMember(must(r)) : null;
  },
  async deleteMember(accountId, id) { const r = await sb().from("members").delete().eq("id", id).eq("account_id", accountId).select("id"); return !!must(r).length; },
  async addTrial(t) {
    return toTrial(must(await sb().from("trials").insert({ account_id: t.accountId ?? null, name: t.name, phone: t.phone, email: t.email ?? null, discipline: t.discipline, age_group: t.ageGroup ?? null, experience: t.experience ?? null, slot: t.slot ?? null }).select().single()));
  },
  async trials() { return must(await sb().from("trials").select("*").order("created_at", { ascending: false }).limit(500)).map(toTrial); },
  async setTrialStatus(id, status) { const r = await sb().from("trials").update({ status }).eq("id", id).select().maybeSingle(); return r.data ? toTrial(must(r)) : null; },
  async staffByPhone(phone) { const r = await sb().from("staff").select("*").eq("phone", phone).maybeSingle(); return r.data ? toStaff(must(r)) : null; },
  async staffById(id) { const r = await sb().from("staff").select("*").eq("id", id).maybeSingle(); return r.data ? toStaff(must(r)) : null; },
};

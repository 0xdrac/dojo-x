import { createHash, randomInt, scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { T } from "./tables";
import { store } from "./store";

/** Phone + 6-digit PIN sign-in. A WhatsApp code (sent through n8n) proves the number when a PIN is first set or forgotten. */
export const pinMode = () => process.env.NEXT_PUBLIC_AUTH_MODE === "pin";
export const isPlaceholder = (phone: string) => /^9000000\d{3}$/.test(phone);

const OTP_TTL = 10 * 60_000, OTP_TRIES = 5, RESEND_GAP = 30_000, SENDS_PER_HOUR = 5;
const PIN_TRIES = 5, LOCK_MS = 15 * 60_000;
const pepper = () => process.env.SESSION_SECRET || "dev-only-secret-change-me";

const hashCode = (phone: string, code: string) => createHash("sha256").update(`${pepper()}|${phone}|${code}`).digest("hex");
const iso = (ms: number) => new Date(ms).toISOString();

/** Who owns this number: a staff login, a member account, or nobody yet. */
export async function subjectFor(phone: string): Promise<{ kind: "staff" | "member"; id: string; name?: string; role?: string } | null> {
  const s = store(), st = await s.staffByPhone(phone);
  if (st) return { kind: "staff", id: st.id, name: st.name, role: st.role };
  const a = await s.accountByPhone(phone);
  return a ? { kind: "member", id: a.id } : null;
}
export async function hasPin(subjectId: string) { return !!(await T.get("credentials", { subject_id: subjectId }))?.pin_hash; }

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pin + pepper(), salt, 32).toString("hex")}`;
}
function checkPinHash(pin: string, stored: string) {
  const [salt, hash] = stored.split(":"); if (!salt || !hash) return false;
  const got = scryptSync(pin + pepper(), salt, 32), want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}
export async function savePin(subjectId: string, kind: string, pin: string) {
  await T.upsert("credentials", { subject_id: subjectId }, { subject_id: subjectId, kind, pin_hash: hashPin(pin), fails: 0, locked_until: null });
}

/** Checks a PIN, counting wrong tries and locking the account for 15 minutes after 5 misses. */
export async function tryPin(subjectId: string, pin: string): Promise<{ ok: boolean; error?: string }> {
  const c = await T.get("credentials", { subject_id: subjectId });
  if (!c?.pin_hash) return { ok: false, error: "Set up your PIN first." };
  if (c.locked_until && Date.parse(c.locked_until) > Date.now()) return { ok: false, error: `Too many wrong tries. Try again in ${Math.ceil((Date.parse(c.locked_until) - Date.now()) / 60000)} minutes, or reset your PIN with a WhatsApp code.` };
  if (checkPinHash(pin, c.pin_hash)) { if (c.fails) await T.update("credentials", { subject_id: subjectId }, { fails: 0, locked_until: null }); return { ok: true }; }
  const fails = (c.fails || 0) + 1, lock = fails >= PIN_TRIES;
  await T.update("credentials", { subject_id: subjectId }, { fails: lock ? 0 : fails, locked_until: lock ? iso(Date.now() + LOCK_MS) : null });
  return { ok: false, error: lock ? "Too many wrong tries. Locked for 15 minutes. You can reset your PIN with a WhatsApp code." : `Wrong PIN. ${PIN_TRIES - fails} ${PIN_TRIES - fails === 1 ? "try" : "tries"} left.` };
}

/** Creates a 6-digit code and hands it to n8n, which sends it on WhatsApp. */
export async function sendOtp(phone: string): Promise<{ ok: boolean; error?: string; devCode?: string }> {
  const now = Date.now(), cur = await T.get("otp_codes", { phone });
  if (cur?.last_sent && now - Date.parse(cur.last_sent) < RESEND_GAP) return { ok: false, error: "Please wait a few seconds before asking for another code." };
  const inWindow = cur?.window_start && now - Date.parse(cur.window_start) < 3600_000;
  if (inWindow && (cur!.sends || 0) >= SENDS_PER_HOUR) return { ok: false, error: "Too many codes requested. Please try again in an hour." };
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const url = process.env.N8N_WEBHOOK_URL, dev = process.env.NODE_ENV !== "production";
  if (!url && !dev) return { ok: false, error: "Code sending isn’t set up yet. Please contact the front desk." };
  if (url) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-dojo-secret": process.env.N8N_WEBHOOK_SECRET || "" }, body: JSON.stringify({ phone, to: "91" + phone, code, message: `Your Dojo X code is ${code}. It expires in 10 minutes. Don’t share it with anyone.` }), signal: AbortSignal.timeout(10_000) });
      if (!r.ok) throw new Error("n8n " + r.status);
    } catch (e: any) { console.error("[otp] n8n failed:", e?.message); return { ok: false, error: "We couldn’t send the WhatsApp code right now. Please try again in a minute." }; }
  } else console.log(`[otp] dev code for ${phone}: ${code}`);
  const row = { phone, code_hash: hashCode(phone, code), expires_at: iso(now + OTP_TTL), tries: 0, last_sent: iso(now), window_start: inWindow ? cur!.window_start : iso(now), sends: inWindow ? (cur!.sends || 0) + 1 : 1 };
  await T.upsert("otp_codes", { phone }, row);
  return { ok: true, devCode: !url && dev ? code : undefined };
}

export async function checkOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const cur = await T.get("otp_codes", { phone });
  if (!cur || Date.parse(cur.expires_at) < Date.now()) return { ok: false, error: "That code has expired. Ask for a new one." };
  if ((cur.tries || 0) >= OTP_TRIES) return { ok: false, error: "Too many wrong tries. Ask for a new code." };
  if (cur.code_hash !== hashCode(phone, String(code))) { await T.update("otp_codes", { phone }, { tries: (cur.tries || 0) + 1 }); return { ok: false, error: "That code doesn’t match." }; }
  await T.delete("otp_codes", { phone });   // single use
  return { ok: true };
}

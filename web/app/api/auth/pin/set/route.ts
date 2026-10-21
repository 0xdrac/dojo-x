import { body, fail, json } from "@/lib/server/util";
import { isPlaceholder, pinMode, savePin, subjectFor } from "@/lib/server/pinauth";
import { readShort, setSession } from "@/lib/server/session";
import { store } from "@/lib/server/store";

const WEAK = new Set(["000000", "111111", "123456", "654321", "121212", "112233", "000001"]);

/** Sets (or resets) the PIN after the WhatsApp code was proven, creates the account if it's a new number, and signs in. */
export async function POST(req: Request) {
  if (!pinMode()) return fail("Not available", 404);
  const b = await body(req), t = readShort(b.setupToken);
  if (!t || t.purpose !== "set-pin") return fail("That step expired. Please request a new code.", 401);
  const phone = String(t.phone), pin = String(b.pin || "");
  if (!/^\d{6}$/.test(pin)) return fail("Your PIN must be 6 digits.");
  if (WEAK.has(pin) || /^(\d)\1{5}$/.test(pin)) return fail("That PIN is too easy to guess. Pick another.");
  if (isPlaceholder(phone)) return fail("This number can’t be used to sign in.", 403);
  const s = store();
  let sub = await subjectFor(phone);
  if (!sub) { const a = await s.createAccount(phone); sub = { kind: "member", id: a.id }; }
  await savePin(sub.id, sub.kind, pin);
  await setSession({ sub: sub.id, kind: sub.kind });
  if (sub.kind === "staff") return json({ ok: true, staff: { name: sub.name, role: sub.role } });
  return json({ ok: true, onboarded: (await s.members(sub.id)).some((m) => m.rel === "You") });
}

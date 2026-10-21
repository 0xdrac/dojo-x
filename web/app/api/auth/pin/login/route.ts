import { body, digits, fail, json, validPhone } from "@/lib/server/util";
import { isPlaceholder, pinMode, subjectFor, tryPin } from "@/lib/server/pinauth";
import { setSession } from "@/lib/server/session";
import { store } from "@/lib/server/store";

export async function POST(req: Request) {
  if (!pinMode()) return fail("Not available", 404);
  const b = await body(req), phone = digits(b.phone), pin = String(b.pin || "");
  if (!validPhone(phone) || isPlaceholder(phone) || !/^\d{6}$/.test(pin)) return fail("Enter your mobile number and 6-digit PIN.");
  const sub = await subjectFor(phone);
  if (!sub) return fail("Wrong number or PIN.", 401);
  const r = await tryPin(sub.id, pin);
  if (!r.ok) return fail(r.error!, 401);
  await setSession({ sub: sub.id, kind: sub.kind });
  if (sub.kind === "staff") return json({ ok: true, staff: { name: sub.name, role: sub.role } });
  return json({ ok: true, onboarded: (await store().members(sub.id)).some((m) => m.rel === "You") });
}

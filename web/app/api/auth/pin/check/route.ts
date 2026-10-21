import { body, digits, fail, json, validPhone } from "@/lib/server/util";
import { checkOtp, pinMode } from "@/lib/server/pinauth";
import { signShort } from "@/lib/server/session";

/** The member typed the WhatsApp code. If it's right, hand back a 10-minute token that allows setting a PIN for this number. */
export async function POST(req: Request) {
  if (!pinMode()) return fail("Not available", 404);
  const b = await body(req), phone = digits(b.phone);
  if (!validPhone(phone) || !/^\d{6}$/.test(String(b.code))) return fail("Enter all 6 digits.");
  const r = await checkOtp(phone, String(b.code));
  return r.ok ? json({ ok: true, setupToken: signShort({ phone, purpose: "set-pin" }, 10 * 60_000) }) : fail(r.error!, 401);
}

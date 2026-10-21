import { body, digits, fail, json, validPhone } from "@/lib/server/util";
import { hasPin, isPlaceholder, pinMode, subjectFor } from "@/lib/server/pinauth";

/** Does this number already have a PIN? Decides whether the login screen asks for the PIN or sends a WhatsApp code. */
export async function POST(req: Request) {
  if (!pinMode()) return fail("Not available", 404);
  const phone = digits((await body(req)).phone);
  if (!validPhone(phone)) return fail("Enter a valid 10-digit Indian mobile number.");
  if (isPlaceholder(phone)) return fail("This number can’t be used to sign in.", 403);
  const sub = await subjectFor(phone);
  return json({ ok: true, hasPin: sub ? await hasPin(sub.id) : false });
}

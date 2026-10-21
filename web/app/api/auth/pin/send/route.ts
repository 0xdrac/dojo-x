import { body, digits, fail, json, validPhone } from "@/lib/server/util";
import { isPlaceholder, pinMode, sendOtp } from "@/lib/server/pinauth";

export async function POST(req: Request) {
  if (!pinMode()) return fail("Not available", 404);
  const phone = digits((await body(req)).phone);
  if (!validPhone(phone) || isPlaceholder(phone)) return fail("Enter a valid 10-digit Indian mobile number.");
  const r = await sendOtp(phone);
  return r.ok ? json({ ok: true, devCode: r.devCode }) : fail(r.error!, 429);
}

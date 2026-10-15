import { store } from "@/lib/server/store";
import { setSession } from "@/lib/server/session";
import { body, checkOtp, digits, fail, json, validPhone } from "@/lib/server/util";

/** Staff sign-in: the phone must be in the staff table. Same demo OTP rule as members. */
export async function POST(req: Request) {
  const b = await body(req), phone = digits(b.phone);
  if (!validPhone(phone)) return fail("Enter a valid 10-digit mobile number.");
  const staff = await store().staffByPhone(phone);
  if (!staff) return fail("This number isn’t registered as staff.", 403);
  if (b.code === undefined) return json({ ok: true, demo: process.env.DEMO_OTP !== "0" });
  const otp = checkOtp(b.code); if (!otp.ok) return fail(otp.error!, 401);
  await setSession({ sub: staff.id, kind: "staff" });
  return json({ ok: true, staff: { name: staff.name, role: staff.role } });
}

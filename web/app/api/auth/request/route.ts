import { body, digits, fail, json, validPhone } from "@/lib/server/util";

// Demo mode: no SMS/WhatsApp is sent. The real provider call goes here later.
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "pin") return fail("Not available", 404);
  const phone = digits((await body(req)).phone);
  if (!validPhone(phone)) return fail("Enter a valid 10-digit Indian mobile number.");
  return json({ ok: true, demo: process.env.DEMO_OTP !== "0" && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
}

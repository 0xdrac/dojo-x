import { store } from "@/lib/server/store";
import { setSession } from "@/lib/server/session";
import { body, checkOtp, digits, fail, json, validPhone } from "@/lib/server/util";

const DEMO_PHONE = "9845021734";

/** Seeds the sample family from the design so the demo number lands in a populated portal. */
async function seedDemo(accountId: string) {
  const s = store(), signed = "8 Jan 2024";
  await s.addMember({ accountId, rel: "You", name: "Aarav Sharma", dob: "1997-03-14", email: "aarav.sharma@gmail.com", gender: "Male", emergency: { name: "Neha Sharma", phone: "9910733482" }, waiver: { signed, by: "Aarav Sharma", type: "Drawn" } });
  await s.addMember({ accountId, rel: "Child", name: "Diya Sharma", dob: "2017-07-02", gender: "Female", emergency: { name: "Aarav Sharma", phone: DEMO_PHONE }, waiver: { signed, by: "Aarav Sharma (guardian)", type: "Typed" } });
  await s.addMember({ accountId, rel: "Spouse", name: "Neha Sharma", dob: "1995-09-22", email: "neha.s@outlook.com", gender: "Female", emergency: { name: "Aarav Sharma", phone: DEMO_PHONE }, waiver: { signed: "3 Mar 2025", by: "Neha Sharma", type: "Drawn" } });
}

export async function POST(req: Request) {
  const b = await body(req), phone = digits(b.phone);
  if (!validPhone(phone)) return fail("Enter a valid 10-digit Indian mobile number.");
  const otp = checkOtp(b.code);
  if (!otp.ok) return fail(otp.error!, 401);
  const s = store();
  // Staff numbers sign in here too and go straight to Admin / Coach App.
  const staff = await s.staffByPhone(phone);
  if (staff) {
    await setSession({ sub: staff.id, kind: "staff" });
    return json({ ok: true, staff: { name: staff.name, role: staff.role } });
  }
  let account = await s.accountByPhone(phone);
  if (!account) {
    account = await s.createAccount(phone);
    if (phone === DEMO_PHONE && process.env.DEMO_OTP !== "0") await seedDemo(account.id);
  }
  await setSession({ sub: account.id, kind: "member" });
  const members = await s.members(account.id);
  return json({ ok: true, onboarded: members.some((m) => m.rel === "You") });
}

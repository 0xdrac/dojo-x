import { store } from "@/lib/server/store";
import { setSession } from "@/lib/server/session";
import { body, checkOtp, digits, fail, json, validPhone } from "@/lib/server/util";
import { T } from "@/lib/server/tables";
import { today } from "@/lib/server/guard";
import { addDays } from "@/lib/classes";
import { addMonths, monthsOf } from "@/lib/server/billing";

const DEMO_PHONE = "9845021734";

/** Seeds the sample family from the design so the demo number lands in a populated portal. */
/** Gives the demo family real, currently-running plans so class booking works for them. Safe to call on every demo login. */
async function ensureDemoPlans(accountId: string) {
  const members = await store().members(accountId), t = today();
  const plans: Record<string, [string[], string, number]> = { "Aarav Sharma": [["mma", "muaythai"], "half", -30], "Diya Sharma": [["karate"], "quarterly", -20], "Neha Sharma": [["yoga"], "monthly", -5] };
  for (const m of members) {
    const p = plans[m.name]; if (!p || (await T.list("memberships", { eq: { member_id: m.id }, limit: 1 })).length) continue;
    const start = addDays(t, p[2]);
    await T.insert("memberships", { member_id: m.id, order_id: null, disciplines: p[0], duration: p[1], starts_on: start, ends_on: addMonths(start, monthsOf(p[1])) });
  }
}

async function seedDemo(accountId: string) {
  const s = store(), signed = "8 Jan 2024";
  await s.addMember({ accountId, rel: "You", name: "Aarav Sharma", dob: "1997-03-14", email: "aarav.sharma@gmail.com", gender: "Male", emergency: { name: "Neha Sharma", phone: "9910733482" }, waiver: { signed, by: "Aarav Sharma", type: "Drawn" } });
  await s.addMember({ accountId, rel: "Child", name: "Diya Sharma", dob: "2017-07-02", gender: "Female", emergency: { name: "Aarav Sharma", phone: DEMO_PHONE }, waiver: { signed, by: "Aarav Sharma (guardian)", type: "Typed" } });
  await s.addMember({ accountId, rel: "Spouse", name: "Neha Sharma", dob: "1995-09-22", email: "neha.s@outlook.com", gender: "Female", emergency: { name: "Aarav Sharma", phone: DEMO_PHONE }, waiver: { signed: "3 Mar 2025", by: "Neha Sharma", type: "Drawn" } });
}

export async function POST(req: Request) {
  const b = await body(req);
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "pin") return fail("Not available", 404);
  const phone = digits(b.phone);
  if (!validPhone(phone)) return fail("Enter a valid 10-digit Indian mobile number.");
  const otp = checkOtp(b.code);
  if (!otp.ok) return fail(otp.error!, 401);
  const s = store();
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
  if (phone === DEMO_PHONE && process.env.DEMO_OTP !== "0") await ensureDemoPlans(account.id);
  await setSession({ sub: account.id, kind: "member" });
  const members = await s.members(account.id);
  return json({ ok: true, onboarded: members.some((m) => m.rel === "You") });
}

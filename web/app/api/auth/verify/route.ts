import { store } from "@/lib/server/store";
import { setSession } from "@/lib/server/session";
import { body, fail, json } from "@/lib/server/util";
import { verifyFirebaseEmail } from "@/lib/server/firebase";

/** Sign-in: the browser sends Firebase's ID token (Google or emailed link). The email comes from the verified token, never from the browser. */
export async function POST(req: Request) {
  const b = await body(req);
  const v = await verifyFirebaseEmail(b.idToken);
  if (!v.email) return fail(v.error!, 401);
  try {
    const s = store(), staff = await s.staffByEmail(v.email);
    if (staff) { await setSession({ sub: staff.id, kind: "staff" }); return json({ ok: true, staff: { name: staff.name, role: staff.role } }); }
    const account = (await s.accountByEmail(v.email)) ?? (await s.createAccount("", v.email));
    await setSession({ sub: account.id, kind: "member" });
    return json({ ok: true, onboarded: (await s.members(account.id)).some((m) => m.rel === "You") });
  } catch (e: any) {
    console.error("[auth/verify]", e);
    return fail(/email|column|null value/i.test(String(e?.message)) ? "Sign-in is almost ready: the database needs the email update. Run the email SQL in Supabase, then try again." : "We couldn’t finish signing you in. Please try again.", 500);
  }
}

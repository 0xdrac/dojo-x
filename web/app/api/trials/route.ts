import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { body, digits, fail, json, str, validPhone } from "@/lib/server/util";

/** Free-trial booking. Open to anyone; linked to an account when the phone already has one (or the visitor is signed in). */
export async function POST(req: Request) {
  const b = await body(req), name = str(b.name), phone = digits(b.phone), discipline = str(b.discipline, 30);
  if (!name) return fail("Enter your name.");
  if (!validPhone(phone)) return fail("Enter a 10-digit Indian mobile number.");
  if (!discipline) return fail("Pick a class.");
  const s = store(), sess = await getSession("member");
  const account = sess ? await s.accountById(sess.sub) : await s.accountByPhone(phone);
  const sl = b.slot && typeof b.slot === "object" ? b.slot : null;
  const trial = await s.addTrial({
    accountId: account?.id ?? null, name, phone, email: str(b.email, 160) || null, discipline, ageGroup: str(b.ageGroup, 20) || null, experience: str(b.experience, 20) || null,
    slot: sl ? { classId: Number(sl.classId) || undefined, title: str(sl.title), day: str(sl.day), time: str(sl.time), coach: str(sl.coach) } : null,
  });
  return json({ ok: true, trial: { id: trial.id } }, 201);
}

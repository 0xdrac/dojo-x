import { store } from "@/lib/server/store";
import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { planSummary } from "@/lib/server/billing";
import { body, digits, fail, json, str, validPhone } from "@/lib/server/util";

const ADMIN = ["owner", "frontdesk"] as const;
async function find(id: string) { return (await store().allMembers()).find((m) => m.id === id) ?? null; }

/** Everything about one member for the admin sheet: profile, plans, upcoming bookings, payments, batch. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard([...ADMIN]); if (isRes(g)) return g.res;
  const m = await find((await params).id); if (!m) return fail("Member not found", 404);
  const [memberships, bookings, orders, batch, classes, family] = await Promise.all([
    T.list("memberships", { eq: { member_id: m.id }, order: ["ends_on", false] }),
    T.list("bookings", { eq: { member_id: m.id } }), T.list("orders"), T.get("batch_prefs", { member_id: m.id }), T.list("classes"), store().members(m.accountId),
  ]);
  const cls = new Map(classes.map((c) => [c.id, c]));
  return json({
    member: m, family: family.filter((f) => f.id !== m.id).map((f) => ({ id: f.id, name: f.name, rel: f.rel })), plan: planSummary(memberships), memberships, batch: batch?.batch ?? "amateur",
    bookings: bookings.filter((b) => b.status !== "cancelled").sort((a, b) => a.on_date.localeCompare(b.on_date)).map((b) => ({ id: b.id, date: b.on_date, status: b.status, title: cls.get(b.class_id)?.title ?? "Class", time: cls.get(b.class_id)?.start_time ?? "" })),
    orders: orders.filter((o) => o.member_ids.includes(m.id) && o.status !== "created").slice(0, 20).map((o) => ({ id: o.id, amount: o.amount, status: o.status, invoice_no: o.invoice_no, created_at: o.created_at, duration: o.duration, disciplines: o.disciplines })),
  });
}

/** Edit anything on a member: name, date of birth, email, gender, relationship, emergency contact, waiver, and the account's mobile number. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard([...ADMIN]); if (isRes(g)) return g.res;
  const m = await find((await params).id); if (!m) return fail("Member not found", 404);
  const b = await body(req), patch: Record<string, any> = {};
  if ("name" in b) { const n = str(b.name); if (!n) return fail("Enter a name."); patch.name = n; }
  if ("dob" in b) { const d = str(b.dob, 10); if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) return fail("Date of birth should be YYYY-MM-DD."); patch.dob = d || null; }
  if ("email" in b) { const e = str(b.email, 160); if (e && !/^\S+@\S+\.\S+$/.test(e)) return fail("That email looks incomplete."); patch.email = e || null; }
  if ("gender" in b) patch.gender = str(b.gender, 20) || null;
  if ("rel" in b) { if (!["You", "Child", "Spouse", "Parent", "Sibling"].includes(b.rel)) return fail("Pick a relationship."); patch.rel = b.rel; }
  if ("emergency" in b) patch.emergency = b.emergency && (b.emergency.name || b.emergency.phone) ? { name: str(b.emergency.name), phone: digits(b.emergency.phone) } : null;
  if ("waiver" in b) {
    if (b.waiver === null || b.waiver === false) patch.waiver = null;
    else patch.waiver = { signed: str(b.waiver.signed, 20) || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), by: str(b.waiver.by) || m.name, type: b.waiver.type === "Drawn" ? "Drawn" : "Typed" };
  }
  if ("phone" in b) {
    const ph = digits(b.phone); if (!validPhone(ph)) return fail("Enter a valid 10-digit mobile number.");
    if (ph !== m.phone) {
      if (await store().accountByPhone(ph)) return fail("Another account already uses that number.", 409);
      await store().setAccountPhone(m.accountId, ph);
    }
  }
  if (Object.keys(patch).length) await store().updateMember(m.accountId, m.id, patch);
  return json({ member: await find(m.id) });
}

/** Remove a member and everything attached to them. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const m = await find((await params).id); if (!m) return fail("Member not found", 404);
  for (const t of ["bookings", "attendance", "memberships", "batch_prefs"]) await T.delete(t, { member_id: m.id });
  await store().deleteMember(m.accountId, m.id);
  return json({ ok: true });
}

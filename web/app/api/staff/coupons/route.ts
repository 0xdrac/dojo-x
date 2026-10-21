import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { body, fail, json, str } from "@/lib/server/util";

const SCOPES = ["All plans", "First plan only", "Quarterly+", "6 & 12 month plans"];

export async function GET() {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  return json({ coupons: await T.list("coupons", { order: ["created_at", false] }) });
}
export async function POST(req: Request) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const b = await body(req), code = str(b.code, 16).toUpperCase();
  if (!/^[A-Z0-9]{4,16}$/.test(code)) return fail("Code must be 4–16 letters or numbers, no spaces.");
  if (!["pct", "flat", "set"].includes(b.type)) return fail("Pick % off, ₹ off or a set price.");
  const value = Number(b.value);
  if (!Number.isInteger(value) || value < 1 || (b.type === "pct" ? value > 90 : value > 50000)) return fail(b.type === "pct" ? "Percent must be 1–90." : "Amount must be a whole number of rupees.");
  const cap = b.cap === "" || b.cap == null ? null : Number(b.cap);
  if (cap !== null && (!Number.isInteger(cap) || cap < 1)) return fail("Usage limit must be a whole number.");
  const until = b.validUntil ? String(b.validUntil).slice(0, 10) : null;
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) return fail("Pick a valid end date.");
  if (await T.get("coupons", { code })) return fail("That code already exists.", 409);
  const scope = SCOPES.includes(b.scope) ? b.scope : "All plans";
  return json({ coupon: await T.insert("coupons", { code, type: b.type, value, cap, uses: 0, valid_until: until, scope, status: "active" }) }, 201);
}

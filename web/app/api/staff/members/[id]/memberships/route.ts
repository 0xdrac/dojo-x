import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { body, fail, json } from "@/lib/server/util";
import { membershipRow } from "@/lib/server/validate";

/** Give a member a plan by hand (free pass, correction, gifted month, ...). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const v = membershipRow(await body(req)); if (v.error) return fail(v.error);
  const row = await T.insert("memberships", { member_id: (await params).id, order_id: null, ...v.row });
  return json({ membership: row }, 201);
}

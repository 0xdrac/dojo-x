import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { eventRow } from "@/lib/server/validate";
import { body, fail, json } from "@/lib/server/util";

export async function GET() {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  return json({ events: await T.list("events", { order: ["starts_at", false] }) });
}
export async function POST(req: Request) {
  const g = await staffGuard(["owner"]); if (isRes(g)) return g.res;
  const v = eventRow(await body(req)); if (v.error) return fail(v.error);
  return json({ event: await T.insert("events", { published: true, price: 0, ...v.row }) }, 201);
}

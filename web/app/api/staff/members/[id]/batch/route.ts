import { T } from "@/lib/server/tables";
import { isRes, staffGuard } from "@/lib/server/guard";
import { BATCH_TIME, autoEnroll } from "@/lib/server/autoenroll";
import { body, fail, json } from "@/lib/server/util";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await staffGuard(["owner", "frontdesk"]); if (isRes(g)) return g.res;
  const b = await body(req), id = (await params).id;
  if (!(b.batch in BATCH_TIME)) return fail("Pick a batch.");
  await T.upsert("batch_prefs", { member_id: id }, { member_id: id, batch: b.batch });
  await autoEnroll(true);
  return json({ ok: true });
}

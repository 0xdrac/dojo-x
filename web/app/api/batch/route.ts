import { store } from "@/lib/server/store";
import { getSession } from "@/lib/server/session";
import { autoEnroll, BATCH_TIME } from "@/lib/server/autoenroll";
import { fillSeats } from "@/lib/server/bookings";
import { istNow } from "@/lib/server/guard";
import { T } from "@/lib/server/tables";
import { body, fail, json } from "@/lib/server/util";

/** Member picks their standard evening batch: { memberId, batch: 'amateur' | 'pro' }. Future auto-bookings move to it. */
export async function POST(req: Request) {
  const sess = await getSession("member");
  if (!sess) return fail("Not signed in", 401);
  const b = await body(req);
  if (!(b.batch in BATCH_TIME)) return fail("Pick a batch.");
  const m = (await store().members(sess.sub)).find((x) => x.id === b.memberId);
  if (!m) return fail("Member not found", 404);
  const prev = await T.get("batch_prefs", { member_id: m.id });
  if (prev?.batch !== b.batch) {
    // drop the not-yet-started auto-bookings in the old batch so the new one can be booked
    const old = BATCH_TIME[prev?.batch || "amateur"];
    const classes = await T.list("classes");
    for (const bk of await T.list("bookings", { eq: { member_id: m.id, status: "booked" } })) {
      const c = classes.find((x) => x.id === bk.class_id);
      if (c && c.start_time === old && c.age_group === "Teens & Adults" && bk.on_date >= istNow().date) { await T.delete("bookings", { id: bk.id }); await fillSeats(bk.class_id, bk.on_date); }
    }
  }
  await T.upsert("batch_prefs", { member_id: m.id }, { member_id: m.id, batch: b.batch });
  await autoEnroll(true);
  return json({ ok: true });
}

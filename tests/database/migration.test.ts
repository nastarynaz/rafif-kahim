import { strict as assert } from "node:assert"
import { test } from "node:test"
import { readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"
import { questionIds } from "../../lib/platform-content"

test("production migration: privacy, N/A aggregation, persistence, dedupe and retention", async (t) => {
  const db = new PGlite()
  await db.exec(
    "create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create role service_role bypassrls;"
  )
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/202610260001_platform.sql",
        import.meta.url
      ),
      "utf8"
    )
  )
  const result = await db.query<{ id: string }>(
    "insert into public.survey_periods(title,starts_at,ends_at,is_open) values('Periode uji',now()-interval '1 day',now()+interval '1 day',true) returning id"
  )
  const period = result.rows[0].id
  const ratings = Object.fromEntries(
    questionIds.map((id) => [id, id === "relasi_2" ? null : 4])
  )
  const submit = (n: number) =>
    db.query(
      "select public.submit_survey($1,$2::jsonb,null,'Teks privat uji',$3)",
      [period, JSON.stringify(ratings), n.toString(16).padStart(64, "0")]
    )
  const aggregate = async () => {
    const r = await db.query<{
      data: {
        total: number
        aspects: {
          aspect: string
          suppressed: boolean
          valid_answers: number
          average: number | null
          distribution: number[]
          na_answers: number
        }[]
      }
    }>("select public.survey_aggregate($1,null) data", [period])
    return r.rows[0].data
  }
  await t.test(
    "small groups have no score, distribution, or private text",
    async () => {
      for (let i = 1; i <= 4; i++) await submit(i)
      const a = await aggregate()
      assert.equal(a.total, 4)
      assert(
        a.aspects.every(
          (x) =>
            x.suppressed &&
            x.average === null &&
            x.valid_answers === 0 &&
            x.distribution.every((n) => n === 0)
        )
      )
      assert(!JSON.stringify(a).includes("Teks privat"))
    }
  )
  await t.test(
    "fifth respondent unlocks scores, N/A excluded and count is distinct people",
    async () => {
      await submit(5)
      const a = await aggregate()
      const rel = a.aspects.find((x) => x.aspect === "relasi")!
      assert.equal(rel.suppressed, false)
      assert.equal(rel.average, 4)
      assert.equal(rel.valid_answers, 5)
      assert.equal(rel.na_answers, 5)
      assert.deepEqual(rel.distribution, [0, 0, 0, 5, 0])
      assert.equal(a.total, 5)
      const a2 = await aggregate()
      assert.deepEqual(a2, a)
    }
  )
  await t.test(
    "duplicate, invalid values and closed periods rejected transactionally",
    async () => {
      await assert.rejects(() => submit(5), /unique|duplicate/i)
      const count = await db.query<{ count: number }>(
        "select count(*)::int as count from public.survey_answers"
      )
      assert.equal(count.rows[0].count, 100)
      await assert.rejects(
        () =>
          db.query("select public.submit_survey($1,$2::jsonb,null,'',$3)", [
            period,
            JSON.stringify({ ...ratings, relasi_1: 9 }),
            "f".repeat(64),
          ]),
        /invalid_rating/
      )
      await db.query(
        "update public.survey_periods set is_open=false where id=$1",
        [period]
      )
      await assert.rejects(() => submit(6), /period_closed/)
    }
  )
  await t.test(
    "excluded responses and small category groups never expose scores",
    async () => {
      await db.query(
        "update public.survey_responses set status='excluded' where dedupe_hash=$1",
        ["1".padStart(64, "0")]
      )
      const a = await aggregate()
      assert.equal(a.total, 4)
      assert(a.aspects.every((x) => x.suppressed))
      const cat = await db.query<{ a: { total: number; aspects: unknown[] } }>(
        "select public.survey_aggregate($1,'BSO') a",
        [period]
      )
      assert.equal(cat.rows[0].a.total, 0)
      assert.deepEqual(cat.rows[0].a.aspects, [])
    }
  )
  await t.test(
    "RLS and database grants deny raw reads and RPC bypass to public roles",
    async () => {
      for (const role of ["anon", "authenticated"]) {
        for (const table of [
          "private_feedback",
          "survey_responses",
          "survey_answers",
          "agenda",
          "admin_users",
          "survey_periods",
          "audit_log",
          "rate_limits",
        ]) {
          const r = await db.query<{ allowed: boolean; rls: boolean }>(
            "select has_table_privilege($1, 'public.' || $2, 'SELECT') allowed, (select relrowsecurity from pg_class where oid=('public.' || $2)::regclass) rls",
            [role, table]
          )
          assert.equal(r.rows[0].allowed, false)
          assert.equal(r.rows[0].rls, true)
        }
        const r = await db.query<{ allowed: boolean }>(
          "select has_function_privilege($1,'public.survey_aggregate(uuid,text)','EXECUTE') allowed",
          [role]
        )
        assert.equal(r.rows[0].allowed, false)
      }
      await db.exec("set role anon")
      await assert.rejects(
        () => db.query("select message from public.private_feedback"),
        /permission denied/
      )
      await db.exec("reset role")
    }
  )
  await t.test("rate limiter enforces shared persistent budget", async () => {
    for (let i = 0; i < 4; i++) {
      const r = await db.query<{ allowed: boolean }>(
        "select public.consume_rate_limit($1,3,60) allowed",
        ["b".repeat(64)]
      )
      assert.equal(r.rows[0].allowed, i < 3)
    }
  })
  await t.test(
    "draft agenda is unconfirmed; expired feedback deleted without exposing content",
    async () => {
      const a = await db.query<{ confirmed: boolean }>(
        "select confirmed from public.agenda"
      )
      assert.equal(a.rows[0].confirmed, false)
      await db.query(
        "insert into public.private_feedback(category,message,consent_status,deletion_hash,retention_deadline) values('Aspirasi','Pesan uji kadaluwarsa',true,$1,now()-interval '1 day')",
        ["a".repeat(64)]
      )
      await db.query("select public.purge_expired_data()")
      const r = await db.query<{ count: number }>(
        "select count(*)::int count from public.private_feedback"
      )
      assert.equal(r.rows[0].count, 0)
    }
  )
  await db.close()
})

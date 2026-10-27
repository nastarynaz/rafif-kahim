/** Loopback-only test protocol adapter. Executes the real migration in PGlite.
 * Auth is a fixture; deployed Supabase Auth must still be smoke-tested.
 * This file is never imported by the application and contains no real credentials. */
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import { PGlite } from "@electric-sql/pglite"
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
const users: Record<string, { id: string; role: string }> = {}
for (const role of ["owner", "agenda", "feedback"]) {
  const id = randomUUID()
  users[`${role}@local.test`] = { id, role }
  await db.query("insert into auth.users(id) values($1)", [id])
  await db.query(
    "insert into public.admin_users(auth_user_id,role) values($1,$2)",
    [id, role]
  )
}
const tokens = new Map<string, { id: string; role: string }>()
const tables = [
  "admin_users",
  "survey_periods",
  "survey_responses",
  "survey_answers",
  "private_feedback",
  "agenda",
  "rate_limits",
  "audit_log",
]
function identifier(s: string) {
  if (!/^[a-z_]+$/.test(s)) throw new Error("Invalid identifier")
  return `"${s}"`
}
function filter(url: URL, params: unknown[]) {
  const conditions: string[] = []
  for (const [key, value] of url.searchParams) {
    if (["select", "order", "limit", "offset"].includes(key)) continue
    const match = /^(eq|neq|gt)\.(.*)$/.exec(value)
    if (!match) throw new Error("Invalid filter")
    params.push(match[2])
    conditions.push(
      `${identifier(key)} ${{ eq: "=", neq: "<>", gt: ">" }[match[1]]} $${params.length}`
    )
  }
  return conditions.length ? ` where ${conditions.join(" and ")}` : ""
}
const rpcNames: Record<string, string[]> = {
  consume_rate_limit: ["p_key", "p_limit", "p_seconds"],
  submit_survey: [
    "p_period",
    "p_ratings",
    "p_target",
    "p_comments",
    "p_dedupe",
  ],
  survey_aggregate: ["p_period", "p_target"],
  admin_survey_summary: [],
  purge_expired_data: [],
}
const server = createServer(async (req, res) => {
  const send = (status: number, data: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" })
    res.end(status === 204 ? undefined : JSON.stringify(data))
  }
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1:54329")
    if (url.pathname === "/health") return send(200, { ready: true })
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(Buffer.from(chunk))
    const raw = Buffer.concat(chunks).toString()
    const body = raw ? JSON.parse(raw) : {}
    if (url.pathname === "/auth/v1/token") {
      const user = users[body.email]
      if (!user || body.password !== "test-only-password")
        return send(400, { error: "invalid" })
      const token = `test-${randomUUID()}`
      tokens.set(token, user)
      return send(200, {
        access_token: token,
        expires_in: 3600,
        user: { id: user.id },
      })
    }
    if (url.pathname === "/auth/v1/user") {
      const user = tokens.get(
        (req.headers.authorization || "").replace("Bearer ", "")
      )
      return user ? send(200, { id: user.id }) : send(401, { error: "invalid" })
    }
    if (url.pathname === "/auth/v1/logout") {
      tokens.delete((req.headers.authorization || "").replace("Bearer ", ""))
      return send(204, null)
    }
    if (req.headers.apikey !== "sb_secret_test_only")
      return send(403, { error: "not allowed" })
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const name = url.pathname.split("/").pop()!,
        keys = rpcNames[name]
      if (!keys) return send(404, { error: "missing" })
      const params = keys.map((k) =>
        typeof body[k] === "object" && body[k] !== null
          ? JSON.stringify(body[k])
          : (body[k] ?? null)
      )
      const r = await db.query<{ result: unknown }>(
        `select public.${identifier(name)}(${params.map((_, i) => `$${i + 1}`).join(",")}) result`,
        params
      )
      return send(200, r.rows[0].result)
    }
    const table = url.pathname.replace("/rest/v1/", "")
    if (!tables.includes(table)) return send(404, { error: "missing" })
    const params: unknown[] = []
    let sql = ""
    const select = url.searchParams.get("select") || "*",
      cols = select === "*" ? "*" : select.split(",").map(identifier).join(",")
    if (req.method === "POST") {
      const keys = Object.keys(body)
      params.push(...keys.map((k) => body[k]))
      sql = `insert into public.${identifier(table)}(${keys.map(identifier).join(",")}) values(${keys.map((_, i) => `$${i + 1}`).join(",")}) returning ${cols}`
    } else if (req.method === "PATCH") {
      const keys = Object.keys(body)
      params.push(...keys.map((k) => body[k]))
      sql = `update public.${identifier(table)} set ${keys.map((k, i) => `${identifier(k)}=$${i + 1}`).join(",")}${filter(url, params)} returning ${cols}`
    } else if (req.method === "DELETE")
      sql = `delete from public.${identifier(table)}${filter(url, params)} returning ${cols}`
    else {
      sql = `select ${cols} from public.${identifier(table)}${filter(url, params)}`
      const order = url.searchParams.get("order")
      if (order) {
        const [field, direction] = order.split(".")
        sql += ` order by ${identifier(field)} ${direction === "desc" ? "desc" : "asc"}`
      }
      sql += ` limit ${Math.min(1000, Math.max(1, Number(url.searchParams.get("limit")) || 100))} offset ${Math.max(0, Number(url.searchParams.get("offset")) || 0)}`
    }
    const result = await db.query(sql, params)
    if (req.headers.prefer === "return=minimal") return send(204, null)
    return send(req.method === "POST" ? 201 : 200, result.rows)
  } catch (e) {
    const err = e as { code?: string; message?: string }
    send(400, { code: err.code, message: err.message })
  }
})
server.listen(54329, "127.0.0.1", () =>
  process.stdout.write("Local test adapter ready\n")
)
for (const signal of ["SIGTERM", "SIGINT"] as const)
  process.on(signal, () => {
    server.close()
    void db.close().then(() => process.exit(0))
  })

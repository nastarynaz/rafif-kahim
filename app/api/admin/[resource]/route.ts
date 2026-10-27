import {
  audit,
  db,
  handle,
  json,
  requestBody,
  requireAdmin,
  rpc,
} from "@/lib/server/backend"
import {
  AppError,
  choice,
  object,
  uuid,
  validateAgenda,
  validatePeriod,
} from "@/lib/validation"

type Context = { params: Promise<{ resource: string }> }
export async function GET(request: Request, context: Context) {
  return handle(async () => {
    const { resource } = await context.params
    if (resource === "feedback") {
      const admin = await requireAdmin("feedback")
      const page = Math.max(
        0,
        Math.min(
          10000,
          Number(new URL(request.url).searchParams.get("page")) || 0
        )
      )
      const rows = await db(
        `private_feedback?select=id,category,subject,message,requested_follow_up,identity_contact,status,internal_notes,created_at,retention_deadline&retention_deadline=gt.${new Date().toISOString()}&order=created_at.desc&limit=20&offset=${Math.floor(page) * 20}`
      )
      await audit(admin, "feedback.list")
      return json(rows)
    }
    await requireAdmin()
    if (resource === "summary")
      return json(await rpc("admin_survey_summary", {}))
    if (resource === "agenda")
      return json(
        await db("agenda?select=*&order=start_datetime.desc&limit=200")
      )
    if (resource === "periods")
      return json(
        await db("survey_periods?select=*&order=starts_at.desc&limit=30")
      )
    if (resource === "admins") {
      await requireAdmin("owner")
      return json(
        await db(
          "admin_users?select=id,auth_user_id,role,created_at&order=created_at.asc"
        )
      )
    }
    if (resource === "export") {
      const periods = await db<{ id: string }[]>(
        "survey_periods?select=id&order=starts_at.desc&limit=30"
      )
      const id =
        new URL(request.url).searchParams.get("period") || periods[0]?.id
      if (!id) return json({ error: "Belum ada periode survei." }, 404)
      return json(
        await rpc("survey_aggregate", { p_period: uuid(id), p_target: null })
      )
    }
    return json({ error: "Data tidak ditemukan." }, 404)
  })
}
export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const { resource } = await context.params
    const admin = await requireAdmin(resource === "agenda" ? "agenda" : "owner")
    const body = await requestBody(request)
    if (resource === "agenda") {
      const rows = await db<{ id: string }[]>("agenda?select=id", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(validateAgenda(body)),
      })
      await audit(admin, "agenda.create", rows[0].id)
      return json({ saved: true }, 201)
    }
    if (resource === "periods") {
      const period = validatePeriod(body)
      // A unique partial index rejects concurrent attempts to open two periods.
      const rows = await db<{ id: string }[]>("survey_periods?select=id", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(period),
      })
      await audit(admin, "period.create", rows[0].id)
      return json({ saved: true }, 201)
    }
    if (resource === "admins") {
      const d = object(body)
      const role = choice(
        d.role,
        ["owner", "feedback", "agenda"] as const,
        "Peran"
      )
      if (role === "owner")
        throw new AppError(
          400,
          "Penambahan owner dilakukan melalui SQL Editor agar akses utama tetap terkontrol."
        )
      await db("admin_users", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ auth_user_id: uuid(d.auth_user_id), role }),
      })
      await audit(admin, "admin.grant")
      return json({ saved: true }, 201)
    }
    return json({ error: "Tindakan tidak ditemukan." }, 404)
  })
}

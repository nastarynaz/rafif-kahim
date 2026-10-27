import {
  audit,
  db,
  handle,
  json,
  requestBody,
  requireAdmin,
} from "@/lib/server/backend"
import {
  AppError,
  object,
  uuid,
  validateAgenda,
  validateFeedbackUpdate,
} from "@/lib/validation"
type Context = { params: Promise<{ resource: string; id: string }> }
export async function PATCH(request: Request, context: Context) {
  return handle(async () => {
    const { resource, id: raw } = await context.params,
      id = uuid(raw)
    const admin = await requireAdmin(
      resource === "feedback"
        ? "feedback"
        : resource === "agenda"
          ? "agenda"
          : "owner"
    )
    const body = await requestBody(request)
    if (resource === "agenda")
      await db(`agenda?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          ...validateAgenda(body),
          updated_at: new Date().toISOString(),
        }),
      })
    else if (resource === "feedback")
      await db(`private_feedback?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(validateFeedbackUpdate(body)),
      })
    else if (resource === "periods") {
      const d = object(body)
      if (typeof d.is_open !== "boolean")
        throw new AppError(400, "Status periode tidak valid.")
      await db(`survey_periods?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ is_open: d.is_open }),
      })
    } else return json({ error: "Tindakan tidak ditemukan." }, 404)
    await audit(admin, `${resource}.update`, id)
    return json({ saved: true })
  })
}
export async function DELETE(request: Request, context: Context) {
  return handle(async () => {
    const { resource, id: raw } = await context.params,
      id = uuid(raw)
    const admin = await requireAdmin(
      resource === "feedback"
        ? "feedback"
        : resource === "agenda"
          ? "agenda"
          : "owner"
    )
    await requestBody(request)
    if (resource === "admins") {
      // Owners cannot be removed via this API; use an audited database operation.
      await db(`admin_users?id=eq.${id}&role=neq.owner`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      })
    } else if (resource === "feedback" || resource === "agenda") {
      await db(
        `${resource === "feedback" ? "private_feedback" : "agenda"}?id=eq.${id}`,
        { method: "DELETE", headers: { Prefer: "return=minimal" } }
      )
    } else return json({ error: "Tindakan tidak ditemukan." }, 404)
    await audit(admin, `${resource}.delete`, id)
    return json({ deleted: true })
  })
}

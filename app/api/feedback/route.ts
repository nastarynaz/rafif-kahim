import { randomBytes } from "node:crypto"
import {
  db,
  handle,
  json,
  rateLimit,
  requestBody,
  secureHash,
} from "@/lib/server/backend"
import {
  AppError,
  object,
  text,
  uuid,
  validateFeedback,
} from "@/lib/validation"

export async function POST(request: Request) {
  return handle(async () => {
    const body = object(await requestBody(request))
    if (body.website) throw new AppError(400, "Pengiriman tidak valid.")
    const data = validateFeedback(body)
    await rateLimit(request, "feedback", 30, 3600)
    const deletionCode = randomBytes(24).toString("hex")
    const result = await db<{ id: string }[]>("private_feedback?select=id", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        ...data,
        deletion_hash: secureHash(`delete:${deletionCode}`),
      }),
    })
    return json(
      { saved: true, receipt: result[0].id, deletion_code: deletionCode },
      201
    )
  })
}
export async function DELETE(request: Request) {
  return handle(async () => {
    const body = object(await requestBody(request)),
      id = uuid(body.receipt),
      code = text(body.deletion_code, "Kode penghapusan", 48, 48)
    await rateLimit(request, "feedback-delete", 10, 3600)
    const hash = secureHash(`delete:${code}`)
    // Same response for a missing/already-deleted receipt and a wrong code.
    await db(`private_feedback?id=eq.${id}&deletion_hash=eq.${hash}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    })
    return json({ processed: true })
  })
}

import { timingSafeEqual } from "node:crypto"
import { db, handle, json, rpc } from "@/lib/server/backend"
import { surveyId } from "@/lib/survey-config"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return handle(async () => {
    const expected = process.env.CRON_SECRET,
      supplied = request.headers.get("authorization") || ""
    if (
      !expected ||
      expected.length < 32 ||
      supplied.length !== `Bearer ${expected}`.length ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(`Bearer ${expected}`))
    )
      return json({ error: "Tidak diizinkan." }, 401)
    await db(`survey_periods?id=eq.${surveyId}&select=id&limit=1`)
    await rpc("purge_expired_data", {})
    return json({ processed: true, keep_alive: true })
  })
}

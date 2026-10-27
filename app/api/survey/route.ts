import {
  handle,
  json,
  rateLimit,
  requestBody,
  rpc,
  submissionIdentity,
} from "@/lib/server/backend"
import { AppError, object, validateSurvey } from "@/lib/validation"
import { surveyId } from "@/lib/survey-config"

export async function POST(request: Request) {
  return handle(async () => {
    const body = object(await requestBody(request))
    if (body.website) throw new AppError(400, "Pengiriman tidak valid.")
    const data = validateSurvey(body)
    if (data.period_id !== surveyId)
      throw new AppError(
        400,
        "Gunakan Survei 1.0 yang tersedia di halaman ini."
      )
    // Shared campus networks can serve many residents; per-browser dedupe is separate.
    await rateLimit(request, "survey", 150, 3600)
    const identity = await submissionIdentity()
    const id = await rpc<string>("submit_survey", {
      p_period: data.period_id,
      p_ratings: data.ratings,
      p_target: data.target_category,
      p_comments: data.optional_comments,
      p_dedupe: identity,
    })
    // The response never returns answers, comments, or the deduplication hash.
    return json({ saved: true, receipt: id }, 201)
  })
}

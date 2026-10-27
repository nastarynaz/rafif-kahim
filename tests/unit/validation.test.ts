import { strict as assert } from "node:assert"
import { test } from "node:test"
import { questionIds } from "../../lib/platform-content"
import {
  validateSurvey,
  validateFeedback,
  validateAgenda,
} from "../../lib/validation"
const period = "a1000000-0000-4000-8000-000000000001"
const ratings = Object.fromEntries(questionIds.map((id) => [id, 4]))
test("survey accepts N/A without turning it into a numeric score", () => {
  const d = validateSurvey({
    period_id: period,
    consent: true,
    ratings: { ...ratings, relasi_2: null },
  })
  assert.equal(d.ratings.relasi_2, null)
})
test("survey rejects invalid, missing, extra and all-N/A answers", () => {
  for (const r of [
    {},
    { ...ratings, relasi_1: 0 },
    { ...ratings, relasi_1: 6 },
    { ...ratings, relasi_1: 4.5 },
    { ...ratings, relasi_1: "5" },
    { ...ratings, extra: 5 },
    Object.fromEntries(questionIds.map((id) => [id, null])),
  ])
    assert.throws(() =>
      validateSurvey({ period_id: period, consent: true, ratings: r })
    )
  assert.throws(() =>
    validateSurvey({ period_id: period, consent: false, ratings })
  )
})
test("feedback requires consent and refuses empty/oversized messages", () => {
  assert.throws(() =>
    validateFeedback({ category: "Aspirasi", message: "", consent: true })
  )
  assert.throws(() =>
    validateFeedback({
      category: "Keluhan",
      message: "x".repeat(6001),
      consent: true,
    })
  )
  assert.throws(() =>
    validateFeedback({
      category: "Keluhan",
      message: "Pesan cukup panjang",
      consent: false,
    })
  )
  const data = validateFeedback({
    category: "Aspirasi",
    message: "  Akses informasi perlu ditingkatkan  ",
    consent: true,
  })
  assert.equal(data.identity_contact, "")
  assert.equal(data.message, "Akses informasi perlu ditingkatkan")
  assert.equal("status" in data, false)
})
test("agenda validates ordering, confirmation and text bounds", () => {
  const a = {
    title: "Diskusi warga",
    description: "",
    start_datetime: "2026-10-29T15:00:00+07:00",
    end_datetime: "2026-10-29T17:00:00+07:00",
    location: "Selasar",
    status: "akan_datang",
    confirmed: false,
  }
  assert.equal(validateAgenda(a).start_datetime, "2026-10-29T08:00:00.000Z")
  assert.throws(() => validateAgenda({ ...a, end_datetime: a.start_datetime }))
  assert.throws(() => validateAgenda({ ...a, confirmed: "true" }))
  assert.throws(() => validateAgenda({ ...a, status: "published" }))
})

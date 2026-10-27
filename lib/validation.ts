import {
  agendaStatuses,
  categories,
  feedbackStatuses,
  questionIds,
  targets,
} from "./platform-content"

export class AppError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AppError(400, "Format data tidak valid.")
  return value as Record<string, unknown>
}
export function text(value: unknown, label: string, min = 0, max = 500) {
  if (value === undefined || value === null) {
    if (!min) return ""
    throw new AppError(400, `${label} wajib diisi.`)
  }
  if (typeof value !== "string")
    throw new AppError(400, `${label} tidak valid.`)
  const v = value.trim()
  if (v.length < min || v.length > max || /\u0000/.test(v))
    throw new AppError(400, `${label} harus berisi ${min}–${max} karakter.`)
  return v
}
export function choice<T extends string>(
  v: unknown,
  choices: readonly T[],
  label: string
): T {
  if (typeof v !== "string" || !choices.includes(v as T))
    throw new AppError(400, `${label} tidak valid.`)
  return v as T
}
export function uuid(v: unknown) {
  const s = text(v, "ID", 36, 36)
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s
    )
  )
    throw new AppError(400, "ID tidak valid.")
  return s
}
export function consent(v: unknown) {
  if (v !== true)
    throw new AppError(400, "Persetujuan pengelolaan data diperlukan.")
  return true
}
export function validateSurvey(value: unknown) {
  const d = object(value),
    ratings = object(d.ratings)
  consent(d.consent)
  if (
    Object.keys(ratings).length !== questionIds.length ||
    Object.keys(ratings).some((k) => !questionIds.includes(k))
  )
    throw new AppError(
      400,
      "Lengkapi setiap pertanyaan atau pilih Belum tahu/Tidak relevan."
    )
  for (const v of Object.values(ratings))
    if (
      v !== null &&
      (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 5)
    )
      throw new AppError(
        400,
        "Nilai survei harus 1–5 atau Belum tahu/Tidak relevan."
      )
  if (!Object.values(ratings).some((v) => v !== null))
    throw new AppError(
      400,
      "Setidaknya satu penilaian berdasarkan pengalaman diperlukan. Kamu boleh melewati survei jika belum memiliki pengalaman yang relevan."
    )
  return {
    period_id: uuid(d.period_id),
    ratings: ratings as Record<string, number | null>,
    target_category: d.target_category
      ? choice(d.target_category, targets, "Kategori")
      : null,
    optional_comments: text(d.optional_comments, "Catatan", 0, 2000),
    consent_status: true,
  }
}
export function validateFeedback(value: unknown) {
  const d = object(value)
  consent(d.consent)
  return {
    category: choice(d.category, categories, "Kategori"),
    subject: text(d.subject, "Subjek", 0, 160),
    message: text(d.message, "Pesan", 10, 6000),
    requested_follow_up: text(d.requested_follow_up, "Harapan", 0, 2000),
    identity_contact: text(d.identity_contact, "Kontak", 0, 200),
    consent_status: true,
  }
}
function datetime(v: unknown, label: string) {
  const s = text(v, label, 10, 40)
  if (!Number.isFinite(Date.parse(s)))
    throw new AppError(400, `${label} tidak valid.`)
  return new Date(s).toISOString()
}
export function validateAgenda(value: unknown) {
  const d = object(value),
    start = datetime(d.start_datetime, "Waktu mulai"),
    end = datetime(d.end_datetime, "Waktu selesai")
  if (end <= start)
    throw new AppError(400, "Waktu selesai harus setelah waktu mulai.")
  if (typeof d.confirmed !== "boolean")
    throw new AppError(400, "Status konfirmasi diperlukan.")
  return {
    title: text(d.title, "Nama kegiatan", 3, 180),
    description: text(d.description, "Deskripsi", 0, 3000),
    start_datetime: start,
    end_datetime: end,
    location: text(d.location, "Lokasi", 1, 250),
    organizer: text(d.organizer, "Penyelenggara", 0, 180),
    status: choice(d.status, agendaStatuses, "Status"),
    confirmed: d.confirmed,
  }
}
export function validateFeedbackUpdate(value: unknown) {
  const d = object(value)
  return {
    status: choice(d.status, feedbackStatuses, "Status"),
    internal_notes: text(d.internal_notes, "Catatan internal", 0, 4000),
  }
}
export function validatePeriod(value: unknown) {
  const d = object(value),
    start = datetime(d.starts_at, "Mulai periode"),
    end = datetime(d.ends_at, "Akhir periode")
  if (end <= start || typeof d.is_open !== "boolean")
    throw new AppError(400, "Periode tidak valid.")
  return {
    title: text(d.title, "Nama periode", 3, 120),
    starts_at: start,
    ends_at: end,
    is_open: d.is_open,
    survey_version: "1.0",
  }
}

import "server-only"
import { cookies } from "next/headers"
import { createHmac, randomUUID } from "node:crypto"
import { AppError } from "../validation"

export const ready = () =>
  Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SECRET_KEY &&
    (process.env.RATE_LIMIT_SECRET?.length ?? 0) >= 32 &&
    !process.env.SUPABASE_URL.includes("YOUR_PROJECT")
  )
export function config() {
  if (!ready())
    throw new AppError(
      503,
      "Layanan pengiriman sedang disiapkan. Silakan coba lagi nanti."
    )
  return {
    url: process.env.SUPABASE_URL!.replace(/\/$/, ""),
    key: process.env.SUPABASE_SECRET_KEY!,
    publicKey: process.env.SUPABASE_PUBLISHABLE_KEY!,
  }
}
export async function db<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const c = config()
  let response: Response
  try {
    response = await fetch(`${c.url}/rest/v1/${path}`, {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
      headers: {
        apikey: c.key,
        ...(!c.key.startsWith("sb_")
          ? { Authorization: `Bearer ${c.key}` }
          : {}),
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  } catch {
    throw new AppError(
      503,
      "Koneksi layanan terputus. Coba lagi; isianmu masih ada di halaman ini."
    )
  }
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as {
      message?: string
      code?: string
    }
    if (problem.code === "23505")
      throw new AppError(
        409,
        path.includes("submit_survey")
          ? "Respons surveimu untuk periode ini sudah tersimpan. Terima kasih."
          : "Data sudah ada atau periode lain masih dibuka. Periksa kembali sebelum menyimpan."
      )
    if (problem.message?.includes("period_closed"))
      throw new AppError(
        409,
        "Periode survei sudah ditutup. Muat ulang untuk melihat periode terbaru."
      )
    throw new AppError(503, "Operasi belum berhasil. Silakan coba kembali.")
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T)
}
export const rpc = <T>(name: string, params: Record<string, unknown>) =>
  db<T>(`rpc/${name}`, { method: "POST", body: JSON.stringify(params) })
export function secureHash(value: string) {
  config()
  return createHmac("sha256", process.env.RATE_LIMIT_SECRET!)
    .update(value)
    .digest("hex")
}
export async function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  seconds: number
) {
  // Vercel overwrites x-vercel-forwarded-for. On other hosts configure a trusted proxy.
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")
    : request.headers.get("x-forwarded-for")
  const day = new Date().toISOString().slice(0, 10)
  const key = secureHash(
    `${day}:${scope}:${ip?.split(",")[0].trim() || "local-shared"}`
  )
  const allowed = await rpc<boolean>("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_seconds: seconds,
  })
  if (!allowed)
    throw new AppError(
      429,
      "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba lagi."
    )
}
export async function submissionIdentity() {
  const jar = await cookies()
  let token = jar.get("kmtsl_participant")?.value
  if (!token || !/^[0-9a-f-]{36}$/.test(token)) {
    token = randomUUID()
    jar.set("kmtsl_participant", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return secureHash(`participant:${token}`)
}
export async function requestBody(request: Request) {
  const origin = request.headers.get("origin")
  const expected = process.env.APP_ORIGIN || new URL(request.url).origin
  if (origin && origin !== new URL(expected).origin)
    throw new AppError(403, "Asal permintaan tidak diizinkan.")
  if (request.headers.get("sec-fetch-site") === "cross-site")
    throw new AppError(403, "Permintaan lintas situs ditolak.")
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError(415, "Gunakan data JSON.")
  if (Number(request.headers.get("content-length")) > 24000)
    throw new AppError(413, "Data terlalu besar.")
  if (!request.body) throw new AppError(400, "Data diperlukan.")
  const reader = request.body.getReader()
  let size = 0
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > 24000) {
      await reader.cancel()
      throw new AppError(413, "Data terlalu besar.")
    }
    chunks.push(value)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown
  } catch {
    throw new AppError(400, "Format JSON tidak valid.")
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
export async function handle(work: () => Promise<Response>) {
  try {
    return await work()
  } catch (e) {
    return json(
      {
        error:
          e instanceof AppError
            ? e.message
            : "Layanan belum dapat memproses permintaan. Coba kembali.",
      },
      e instanceof AppError ? e.status : 500
    )
  }
}
export type Admin = {
  id: string
  auth_user_id: string
  role: "owner" | "feedback" | "agenda"
}
export async function requireAdmin(
  permission?: "feedback" | "agenda" | "owner"
): Promise<Admin> {
  const token = (await cookies()).get("kmtsl_admin")?.value
  if (!token) throw new AppError(401, "Silakan masuk sebagai admin.")
  const c = config()
  const response = await fetch(`${c.url}/auth/v1/user`, {
    cache: "no-store",
    headers: { apikey: c.publicKey, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok)
    throw new AppError(401, "Sesi berakhir. Silakan masuk kembali.")
  const user = (await response.json()) as { id: string }
  if (!user.id || !/^[0-9a-f-]{36}$/.test(user.id))
    throw new AppError(401, "Sesi tidak valid.")
  const admins = await db<Admin[]>(
    `admin_users?auth_user_id=eq.${user.id}&select=id,auth_user_id,role&limit=1`
  )
  const admin = admins[0]
  if (
    !admin ||
    (permission && admin.role !== "owner" && admin.role !== permission)
  )
    throw new AppError(
      403,
      "Akun ini tidak memiliki izin untuk tindakan tersebut."
    )
  return admin
}
export async function audit(
  admin: Admin,
  action: string,
  entityId: string | null = null
) {
  await db("audit_log", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ admin_id: admin.id, action, entity_id: entityId }),
  })
}

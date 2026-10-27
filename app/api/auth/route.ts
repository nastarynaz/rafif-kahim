import { cookies } from "next/headers"
import {
  config,
  handle,
  json,
  rateLimit,
  requestBody,
  requireAdmin,
} from "@/lib/server/backend"
import { AppError, object, text } from "@/lib/validation"

export async function GET() {
  return handle(async () => json(await requireAdmin()))
}
export async function POST(request: Request) {
  return handle(async () => {
    const body = object(await requestBody(request)),
      email = text(body.email, "Email", 3, 254),
      password = text(body.password, "Kata sandi", 8, 200)
    await rateLimit(request, "login", 8, 900)
    const c = config(),
      response = await fetch(`${c.url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: c.publicKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      })
    if (!response.ok)
      throw new AppError(401, "Email atau kata sandi tidak cocok.")
    const session = (await response.json()) as {
      access_token: string
      expires_in: number
      user: { id: string }
    }
    const jar = await cookies()
    jar.set("kmtsl_admin", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: Math.min(session.expires_in || 3600, 3600),
    })
    try {
      const admin = await requireAdmin()
      return json({ role: admin.role })
    } catch {
      jar.delete("kmtsl_admin")
      throw new AppError(
        403,
        "Akun belum diberi akses admin. Hubungi pengelola."
      )
    }
  })
}
export async function DELETE(request: Request) {
  return handle(async () => {
    await requestBody(request)
    const jar = await cookies()
    const token = jar.get("kmtsl_admin")?.value
    jar.delete("kmtsl_admin")
    if (token) {
      const c = config()
      await fetch(`${c.url}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: c.publicKey, Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      }).catch(() => undefined)
    }
    return json({ signed_out: true })
  })
}

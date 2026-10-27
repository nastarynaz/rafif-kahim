import { db, handle, json, ready, rpc } from "@/lib/server/backend"
import { choice, uuid } from "@/lib/validation"
import {
  targets,
  type Agenda,
  type Period,
  type Results,
} from "@/lib/platform-content"

export async function GET(request: Request) {
  return handle(async () => {
    const url = new URL(request.url),
      resource = url.searchParams.get("resource") || "status"
    if (resource === "status")
      return json({
        configured: ready(),
        readers:
          process.env.FEEDBACK_READERS ||
          "Rafif dan admin aspirasi yang diberi wewenang",
        retention_days: 180,
      })
    if (resource === "periods") {
      const periods = await db<Period[]>(
        "survey_periods?select=id,title,starts_at,ends_at,is_open,survey_version&order=starts_at.desc&limit=30"
      )
      const now = Date.now()
      return json(
        periods.map((p) => ({
          ...p,
          is_open:
            p.is_open &&
            Date.parse(p.starts_at) <= now &&
            Date.parse(p.ends_at) > now,
        }))
      )
    }
    if (resource === "agenda")
      return json(
        await db<Agenda[]>(
          "agenda?confirmed=eq.true&select=id,title,description,start_datetime,end_datetime,location,organizer,status,confirmed,updated_at&order=start_datetime.asc&limit=200"
        )
      )
    if (resource === "results") {
      const periods = await db<Period[]>(
        "survey_periods?select=id,title,starts_at,ends_at,is_open,survey_version&order=starts_at.desc&limit=30"
      )
      const selected = url.searchParams.get("period")
      const period = selected
        ? periods.find((p) => p.id === uuid(selected))
        : periods.find((p) => p.is_open) || periods[0]
      if (!period)
        return json({
          total: 0,
          updated_at: null,
          fetched_at: new Date().toISOString(),
          aspects: [],
          period: null,
          minimum: 5,
        })
      const category = url.searchParams.get("category")
      const result = await rpc<Omit<Results, "period" | "fetched_at">>(
        "survey_aggregate",
        {
          p_period: period.id,
          p_target: category ? choice(category, targets, "Kategori") : null,
        }
      )
      return json({ ...result, period, fetched_at: new Date().toISOString() })
    }
    return json({ error: "Halaman data tidak ditemukan." }, 404)
  })
}

import { db, handle, json } from "@/lib/server/backend"
import { uuid } from "@/lib/validation"
import type { Agenda } from "@/lib/platform-content"
const escapeICS = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r/g, "")
const stamp = (s: string) =>
  new Date(s)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
// RFC 5545 line folding at 75 octets without splitting a Unicode code point.
function fold(line: string) {
  const lines: string[] = []
  let part = ""
  for (const char of line) {
    if (Buffer.byteLength(part + char, "utf8") > 75) {
      lines.push(part)
      part = " "
    }
    part += char
  }
  lines.push(part)
  return lines.join("\r\n")
}
export async function GET(request: Request) {
  return handle(async () => {
    const id = uuid(new URL(request.url).searchParams.get("id"))
    const rows = await db<Agenda[]>(
      `agenda?id=eq.${id}&confirmed=eq.true&status=neq.dibatalkan&select=*&limit=1`
    )
    const a = rows[0]
    if (!a) return json({ error: "Agenda tidak tersedia." }, 404)
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Samanvaya Sahakara//Agenda//ID",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${a.id}@rafif-dewa`,
      `DTSTAMP:${stamp(a.updated_at)}`,
      `DTSTART:${stamp(a.start_datetime)}`,
      `DTEND:${stamp(a.end_datetime)}`,
      `SUMMARY:${escapeICS(a.title)}`,
      `DESCRIPTION:${escapeICS(a.description)}`,
      `LOCATION:${escapeICS(a.location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
    return new Response(lines.map(fold).join("\r\n") + "\r\n", {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="agenda-kmtsl.ics"',
        "Cache-Control": "no-store",
      },
    })
  })
}

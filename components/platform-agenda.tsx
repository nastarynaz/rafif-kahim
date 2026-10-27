"use client"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  List,
  MapPin,
} from "lucide-react"
import { useLiveData } from "@/hooks/use-live-data"
import { type Agenda } from "@/lib/platform-content"
import { hasPublishedSchedule } from "@/lib/agenda-config"
import { Notice, PageIntro } from "./platform-shell"

export const dateLabel = (
  value: string,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
) =>
  new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    ...options,
  }).format(new Date(value))
export function effectiveStatus(a: Agenda) {
  if (a.status === "dibatalkan" || a.status === "selesai") return a.status
  if (!hasPublishedSchedule(a)) return "akan_datang"
  const now = Date.now()
  return now >= Date.parse(a.end_datetime)
    ? "selesai"
    : now >= Date.parse(a.start_datetime)
      ? "berlangsung"
      : "akan_datang"
}
const statusLabels = {
  akan_datang: "Akan datang",
  berlangsung: "Berlangsung",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
}
function EmptyAgenda({ preview = false }: { preview?: boolean }) {
  return (
    <div className="p-empty p-agenda-empty">
      <CalendarDays size={36} strokeWidth={1} />
      <div>
        <h3>Ruang bertemu sedang disiapkan.</h3>
        <p>
          Belum ada agenda terkonfirmasi. Informasi waktu dan tempat akan muncul
          di sini setelah dipastikan.
        </p>
      </div>
      {preview && (
        <Link
          href="/#agenda"
          className="p-round-link"
          aria-label="Buka halaman agenda"
        >
          <ArrowUpRight />
        </Link>
      )}
    </div>
  )
}
function AgendaCard({ event }: { event: Agenda }) {
  const status = effectiveStatus(event)
  const scheduled = hasPublishedSchedule(event)
  return (
    <details
      className={
        scheduled ? "p-agenda-card" : "p-agenda-card p-agenda-unscheduled"
      }
    >
      <summary>
        {scheduled && (
          <div className="p-date-block">
            <strong>
              {dateLabel(event.start_datetime, { day: "2-digit" })}
            </strong>
            <span>
              {dateLabel(event.start_datetime, {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
        <div className="p-agenda-card-copy">
          <span
            className={`p-badge ${status === "dibatalkan" ? "cancelled" : ""}`}
          >
            {!scheduled && status === "akan_datang"
              ? "Jadwal menyusul"
              : statusLabels[status]}
          </span>
          <h3>{event.title}</h3>
          <div className="p-event-meta">
            {scheduled && (
              <span>
                <Clock3 size={14} />
                {dateLabel(event.start_datetime, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                –
                {dateLabel(event.end_datetime, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </span>
            )}
            <span>
              <MapPin size={14} />
              {event.location}
            </span>
          </div>
        </div>
        <ArrowUpRight className="p-agenda-arrow" />
      </summary>
      <div className="p-agenda-detail">
        <p>{event.description}</p>
        {event.organizer && <p>Penyelenggara: {event.organizer}</p>}
        {scheduled && <small>Diperbarui {dateLabel(event.updated_at)}</small>}
        {scheduled && status !== "dibatalkan" && (
          <a href={`/api/calendar?id=${event.id}`} className="p-text-link">
            Tambah ke kalender <CalendarDays size={16} />
          </a>
        )}
      </div>
    </details>
  )
}
export function AgendaPreview() {
  const { data, error } = useLiveData<Agenda[]>(
    "/api/public?resource=agenda",
    30000
  )
  const upcoming =
    data
      ?.filter((a) =>
        ["akan_datang", "berlangsung"].includes(effectiveStatus(a))
      )
      .slice(0, 2) || []
  return (
    <>
      {upcoming.length ? (
        upcoming.map((a) => <AgendaCard key={a.id} event={a} />)
      ) : (
        <EmptyAgenda preview />
      )}
      {error && (
        <p className="p-muted p-small">
          Informasi agenda belum dapat disinkronkan. Silakan cek kembali nanti.
        </p>
      )}
    </>
  )
}
export function AgendaPage() {
  const { data, error, loading, reload } = useLiveData<Agenda[]>(
    "/api/public?resource=agenda",
    15000
  )
  const [view, setView] = useState("list"),
    [filter, setFilter] = useState("semua"),
    [month, setMonth] = useState(() => {
      const parts = new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "numeric",
      }).formatToParts(new Date())
      const year = Number(parts.find((p) => p.type === "year")!.value)
      const month = Number(parts.find((p) => p.type === "month")!.value)
      return new Date(Date.UTC(year, month - 1, 1))
    })
  const events = (data || []).filter(
    (a) => filter === "semua" || effectiveStatus(a) === filter
  )
  const monthName = new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(month)
  const first = new Date(
      Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)
    ),
    days = new Date(
      Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0)
    ).getUTCDate()
  const shift = (n: number) =>
    setMonth(
      new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + n, 1))
    )
  return (
    <>
      <PageIntro
        headingLevel={2}
        eyebrow="05 / AGENDA BERSAMA"
        title="Kapan kita"
        italic="bertemu?"
      >
        Temukan kegiatan, cek waktu dan tempat, lalu simpan ke kalendermu.
      </PageIntro>
      <section className="p-container p-section-bottom">
        <div className="p-toolbar">
          <div className="p-filter-chips">
            {[
              ["semua", "Semua"],
              ["akan_datang", "Mendatang"],
              ["berlangsung", "Berlangsung"],
              ["selesai", "Selesai"],
              ["dibatalkan", "Dibatalkan"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="p-view-toggle">
            <button
              aria-label="Tampilan daftar"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={18} />
            </button>
            <button
              aria-label="Tampilan kalender"
              aria-pressed={view === "calendar"}
              onClick={() => setView("calendar")}
            >
              <CalendarDays size={18} />
            </button>
          </div>
        </div>
        {error && (
          <Notice error>
            {error}{" "}
            <button className="p-inline-button" onClick={() => void reload()}>
              Coba lagi
            </button>
          </Notice>
        )}
        {loading && <div className="p-skeleton" aria-label="Memuat agenda" />}
        {view === "list" ? (
          events.length ? (
            <div className="p-agenda-list">
              {events.map((a) => (
                <AgendaCard key={a.id} event={a} />
              ))}
            </div>
          ) : (
            !loading && <EmptyAgenda />
          )
        ) : (
          <div className="p-calendar">
            <div className="p-calendar-header">
              <h2>{monthName}</h2>
              <div>
                <button aria-label="Bulan sebelumnya" onClick={() => shift(-1)}>
                  <ArrowLeft size={18} />
                </button>
                <button aria-label="Bulan berikutnya" onClick={() => shift(1)}>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
            <div className="p-calendar-grid">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div key={d} className="p-calendar-day-name">
                  {d}
                </div>
              ))}
              {Array.from({ length: first.getUTCDay() }, (_, i) => (
                <div key={`empty${i}`} className="p-calendar-cell blank" />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const day = i + 1,
                  key = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const daily = events.filter(
                  (a) =>
                    hasPublishedSchedule(a) &&
                    new Intl.DateTimeFormat("en-CA", {
                      timeZone: "Asia/Jakarta",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }).format(new Date(a.start_datetime)) === key
                )
                return (
                  <div
                    key={day}
                    className={
                      daily.length
                        ? "p-calendar-cell has-event"
                        : "p-calendar-cell"
                    }
                  >
                    <span>{day}</span>
                    {daily.map((a) => (
                      <a key={a.id} href={`#agenda-${a.id}`} title={a.title}>
                        {a.title}
                      </a>
                    ))}
                  </div>
                )
              })}
            </div>
            <div className="p-calendar-events">
              {events
                .filter(
                  (a) =>
                    hasPublishedSchedule(a) &&
                    dateLabel(a.start_datetime, {
                      month: "numeric",
                      year: "numeric",
                    }) ===
                      dateLabel(month.toISOString(), {
                        month: "numeric",
                        year: "numeric",
                      })
                )
                .map((a) => (
                  <div id={`agenda-${a.id}`} key={a.id}>
                    <AgendaCard event={a} />
                  </div>
                ))}
            </div>
            <div className="p-agenda-list">
              {events
                .filter((a) => !hasPublishedSchedule(a))
                .map((a) => (
                  <AgendaCard key={a.id} event={a} />
                ))}
            </div>
          </div>
        )}
        <p className="p-method-note">
          Waktu ditampilkan dalam WIB. Hanya agenda yang sudah dikonfirmasi
          admin yang dipublikasikan. Data diperiksa ulang secara otomatis.
        </p>
      </section>
    </>
  )
}

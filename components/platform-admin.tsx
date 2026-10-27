"use client"
import { useEffect, useState } from "react"
import {
  CalendarDays,
  Download,
  FileBarChart,
  Inbox,
  LockKeyhole,
  LogOut,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react"
import { api, announceUpdate, useLiveData } from "@/hooks/use-live-data"
import {
  agendaStatuses,
  feedbackStatuses,
  type Agenda,
  type Period,
} from "@/lib/platform-content"
import { Notice, PageIntro } from "./platform-shell"
import { dateLabel } from "./platform-agenda"

type Admin = {
  id: string
  auth_user_id: string
  role: "owner" | "feedback" | "agenda"
}
type Feedback = {
  id: string
  category: string
  subject: string
  message: string
  requested_follow_up: string
  identity_contact: string
  status: string
  internal_notes: string
  created_at: string
  retention_deadline: string
}
export function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("summary")
  useEffect(() => {
    api<Admin>("/api/auth")
      .then(setAdmin)
      .catch(() => undefined)
      .finally(() => setChecking(false))
  }, [])
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError("")
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      await api("/api/auth", { method: "POST", body: JSON.stringify(data) })
      setAdmin(await api<Admin>("/api/auth"))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tidak dapat masuk.")
    } finally {
      setBusy(false)
    }
  }
  async function logout() {
    try {
      await api("/api/auth", { method: "DELETE", body: "{}" })
      setAdmin(null)
      setTab("summary")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Keluar belum berhasil.")
    }
  }
  if (checking)
    return (
      <section className="p-container p-section">
        <div className="p-skeleton tall" aria-label="Memeriksa sesi admin" />
      </section>
    )
  if (!admin)
    return (
      <section className="p-container p-login-section">
        <div className="p-login-copy">
          <span className="p-eyebrow">RUANG PENGELOLA</span>
          <h1>
            Merawat rumah,
            <br />
            <em>menjaga kepercayaan.</em>
          </h1>
          <p>
            Akses khusus untuk pengelola yang telah diberi wewenang. Setiap
            peran memiliki izin sesuai tanggung jawabnya.
          </p>
          <ShieldCheck size={55} strokeWidth={1} />
        </div>
        <form className="p-form-panel p-login-form" onSubmit={login}>
          <LockKeyhole size={25} />
          <h2>Masuk sebagai admin.</h2>
          <p>Gunakan akun yang sudah didaftarkan pengelola.</p>
          <label className="p-field">
            Email
            <input name="email" type="email" required autoComplete="username" />
          </label>
          <label className="p-field">
            Kata sandi
            <input
              name="password"
              type="password"
              minLength={8}
              maxLength={200}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <Notice error>{error}</Notice>}
          <button className="p-button p-full-button" disabled={busy}>
            {busy ? "Memeriksa akses…" : "Masuk"}
            <LockKeyhole size={16} />
          </button>
          <p className="p-small p-muted">
            Akun tidak bisa didaftarkan dari halaman publik. Hubungi pengelola
            untuk akses atau pemulihan kata sandi.
          </p>
        </form>
      </section>
    )
  const tabs = [
    { id: "summary", label: "Ringkasan", icon: FileBarChart },
    ...(admin.role !== "agenda"
      ? [{ id: "feedback", label: "Aspirasi privat", icon: Inbox }]
      : []),
    ...(admin.role !== "feedback"
      ? [{ id: "agenda", label: "Agenda", icon: CalendarDays }]
      : []),
    ...(admin.role === "owner"
      ? [
          { id: "periods", label: "Survei 1.0", icon: Settings2 },
          { id: "admins", label: "Akses admin", icon: Users },
        ]
      : []),
  ]
  return (
    <>
      <PageIntro
        eyebrow="PANEL ADMIN"
        title="Kerja yang tertata."
        italic="Kepercayaan yang dijaga."
      >
        Kelola informasi, dengarkan masukan, dan pastikan setiap akses sesuai
        tanggung jawab. Peran aktif: {admin.role}.
      </PageIntro>
      <section className="p-container p-admin-layout p-section-bottom">
        <aside className="p-admin-nav" aria-label="Bagian panel admin">
          {tabs.map((t) => (
            <button
              key={t.id}
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
          <button onClick={() => void logout()}>
            <LogOut size={18} />
            Keluar
          </button>
        </aside>
        <div className="p-admin-content">
          {error && <Notice error>{error}</Notice>}
          {tab === "summary" && <AdminSummary />}
          {tab === "feedback" && admin.role !== "agenda" && <FeedbackAdmin />}
          {tab === "agenda" && admin.role !== "feedback" && <AgendaAdmin />}
          {tab === "periods" && admin.role === "owner" && <PeriodAdmin />}
          {tab === "admins" && admin.role === "owner" && <AccessAdmin />}
        </div>
      </section>
    </>
  )
}
function AdminSummary() {
  const { data, error, reload, syncedAt } = useLiveData<{
    received: number
    valid: number
    excluded: number
    latest: string | null
  }>("/api/admin/summary", 15000)
  const [exportError, setExportError] = useState("")
  async function download() {
    try {
      const data = await api("/api/admin/export")
      const href = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      )
      const a = document.createElement("a")
      a.href = href
      a.download = "hasil-agregat-kmtsl.json"
      a.click()
      setTimeout(() => URL.revokeObjectURL(href), 1000)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Ekspor gagal.")
    }
  }
  return (
    <>
      <div className="p-admin-title">
        <h2>Ringkasan survei.</h2>
        <button className="p-text-link" onClick={() => void reload()}>
          <RefreshCw size={15} />
          Segarkan
        </button>
      </div>
      {error && <Notice error>{error}</Notice>}
      <div className="p-stat-grid">
        {[
          ["RESPONS MASUK", data?.received],
          ["RESPONS VALID", data?.valid],
          ["DIKECUALIKAN", data?.excluded],
        ].map(([label, n]) => (
          <div className="p-stat-card" key={label}>
            <span>{label}</span>
            <strong>{n ?? "—"}</strong>
          </div>
        ))}
      </div>
      <div className="p-information-box">
        <h3>Status sinkronisasi</h3>
        <p>
          {syncedAt
            ? `Koneksi berhasil diperiksa ${dateLabel(syncedAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} WIB.`
            : "Menunggu pemeriksaan koneksi."}
        </p>
        <p>
          Respons invalid ditolak sebelum penyimpanan. Respons yang dikecualikan
          tidak masuk hasil publik. Peninjauan pengecualian dilakukan pengelola
          di database; jangan mengubah status tanpa alasan yang terdokumentasi.
        </p>
        <p>
          Ekspor hanya berisi agregat yang memenuhi ambang privasi. Tidak
          menyertakan teks bebas atau identitas.
        </p>
        <button className="p-button" onClick={() => void download()}>
          <Download size={16} />
          Ekspor Agregat
        </button>
        {exportError && <Notice error>{exportError}</Notice>}
      </div>
    </>
  )
}
function FeedbackAdmin() {
  const [page, setPage] = useState(0),
    { data, error, reload } = useLiveData<Feedback[]>(
      `/api/admin/feedback?page=${page}`,
      30000
    )
  return (
    <>
      <div className="p-admin-title">
        <h2>Aspirasi privat.</h2>
        <span className="p-badge">
          <LockKeyhole size={13} /> Akses terbatas
        </span>
      </div>
      <p className="p-muted">
        Jangan menyalin pesan ke kanal publik. Baca dan gunakan hanya untuk
        peninjauan serta tindak lanjut.
      </p>
      {error && <Notice error>{error}</Notice>}
      {data?.length === 0 && (
        <div className="p-empty">
          <Inbox size={34} />
          <h3>Belum ada pesan pada halaman ini.</h3>
        </div>
      )}
      {data?.map((f) => (
        <FeedbackItem key={f.id} feedback={f} reload={reload} />
      ))}
      <div className="p-toolbar">
        <button
          className="p-button secondary small"
          disabled={!page}
          onClick={() => setPage((p) => p - 1)}
        >
          Sebelumnya
        </button>
        <span>Halaman {page + 1}</span>
        <button
          className="p-button secondary small"
          disabled={!data || data.length < 20}
          onClick={() => setPage((p) => p + 1)}
        >
          Berikutnya
        </button>
      </div>
    </>
  )
}
function FeedbackItem({
  feedback: f,
  reload,
}: {
  feedback: Feedback
  reload: () => Promise<void>
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState(false)
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      await api(`/api/admin/feedback/${f.id}`, {
        method: "PATCH",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Penyimpanan gagal.")
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    setBusy(true)
    try {
      await api(`/api/admin/feedback/${f.id}`, { method: "DELETE", body: "{}" })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Penghapusan gagal.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <details className="p-admin-feedback">
      <summary>
        <div>
          <span className="p-badge">
            {f.category} · {f.status}
          </span>
          <h3>{f.subject || "Cerita tanpa subjek"}</h3>
          <small>
            {dateLabel(f.created_at)} · {f.id.slice(0, 8)}
          </small>
        </div>
        <Plus size={20} />
      </summary>
      <div className="p-admin-feedback-body">
        <p className="p-preserve">{f.message}</p>
        {f.requested_follow_up && (
          <div className="p-information-box">
            <strong>Harapan pengirim</strong>
            <p className="p-preserve">{f.requested_follow_up}</p>
          </div>
        )}
        {f.identity_contact && <p>Kontak sukarela: {f.identity_contact}</p>}
        <small>Batas retensi: {dateLabel(f.retention_deadline)}</small>
        <form onSubmit={save}>
          <label className="p-field">
            Status peninjauan
            <select name="status" defaultValue={f.status}>
              {feedbackStatuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="p-field">
            Catatan internal
            <textarea
              name="internal_notes"
              maxLength={4000}
              defaultValue={f.internal_notes}
              rows={3}
            />
          </label>
          {error && <Notice error>{error}</Notice>}
          <div className="p-actions">
            <button className="p-button small" disabled={busy}>
              Simpan Tindak Lanjut
            </button>
            <button
              className="p-text-link p-danger"
              type="button"
              onClick={() => setDeleting(!deleting)}
            >
              Hapus pesan
            </button>
          </div>
          {deleting && (
            <div className="p-notice error">
              <p>Hapus permanen pesan ini beserta catatan internalnya?</p>
              <button
                type="button"
                className="p-inline-button"
                disabled={busy}
                onClick={() => void remove()}
              >
                Ya, hapus permanen
              </button>
            </div>
          )}
        </form>
      </div>
    </details>
  )
}
function localTime(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(value))
    .replace(" ", "T")
}
function AgendaAdmin() {
  const { data, error, reload } = useLiveData<Agenda[]>(
      "/api/admin/agenda",
      30000
    ),
    [editing, setEditing] = useState<Agenda | null | undefined>(undefined),
    [message, setMessage] = useState("")
  return (
    <>
      <div className="p-admin-title">
        <h2>Kelola agenda.</h2>
        <button className="p-button small" onClick={() => setEditing(null)}>
          <Plus size={16} />
          Agenda Baru
        </button>
      </div>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      {editing !== undefined && (
        <AgendaEditor
          key={editing?.id || "new"}
          event={editing}
          close={() => setEditing(undefined)}
          saved={async () => {
            setEditing(undefined)
            setMessage("Agenda berhasil disimpan.")
            await reload()
            announceUpdate()
          }}
        />
      )}
      <div className="p-admin-list">
        {data?.map((a) => (
          <div className="p-admin-list-row" key={a.id}>
            <div>
              <span className="p-badge">
                {a.confirmed ? "Publik" : "Draft · belum dikonfirmasi"} ·{" "}
                {a.status.replace("_", " ")}
              </span>
              <h3>{a.title}</h3>
              <p>
                {dateLabel(a.start_datetime)} · {a.location}
              </p>
            </div>
            <button className="p-text-link" onClick={() => setEditing(a)}>
              Kelola
            </button>
          </div>
        ))}
      </div>
      {data?.length === 0 && (
        <div className="p-empty">
          <CalendarDays size={32} />
          <h3>Belum ada agenda.</h3>
        </div>
      )}
    </>
  )
}
function AgendaEditor({
  event: a,
  close,
  saved,
}: {
  event: Agenda | null
  close: () => void
  saved: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [deleting, setDeleting] = useState(false)
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget),
      d = Object.fromEntries(form)
    setBusy(true)
    setError("")
    try {
      await api(a ? `/api/admin/agenda/${a.id}` : "/api/admin/agenda", {
        method: a ? "PATCH" : "POST",
        body: JSON.stringify({
          ...d,
          start_datetime: `${d.start_datetime}:00+07:00`,
          end_datetime: `${d.end_datetime}:00+07:00`,
          confirmed: form.get("confirmed") === "on",
        }),
      })
      await saved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Agenda belum tersimpan.")
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    setBusy(true)
    try {
      await api(`/api/admin/agenda/${a!.id}`, { method: "DELETE", body: "{}" })
      await saved()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Penghapusan gagal.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="p-form-panel p-admin-editor" onSubmit={save}>
      <div className="p-admin-title">
        <h3>{a ? "Ubah agenda" : "Agenda baru"}</h3>
        <button type="button" onClick={close} aria-label="Tutup editor agenda">
          <X size={20} />
        </button>
      </div>
      <label className="p-field">
        Nama kegiatan
        <input
          name="title"
          required
          minLength={3}
          maxLength={180}
          defaultValue={a?.title}
        />
      </label>
      <label className="p-field">
        Deskripsi
        <textarea
          name="description"
          maxLength={3000}
          rows={3}
          defaultValue={a?.description}
        />
      </label>
      <div className="p-two-fields">
        <label className="p-field">
          Mulai (WIB)
          <input
            type="datetime-local"
            name="start_datetime"
            required
            defaultValue={a ? localTime(a.start_datetime) : ""}
          />
        </label>
        <label className="p-field">
          Selesai (WIB)
          <input
            type="datetime-local"
            name="end_datetime"
            required
            defaultValue={a ? localTime(a.end_datetime) : ""}
          />
        </label>
      </div>
      <label className="p-field">
        Lokasi
        <input
          name="location"
          required
          maxLength={250}
          defaultValue={a?.location}
        />
      </label>
      <label className="p-field">
        Penyelenggara / kontak
        <input name="organizer" maxLength={180} defaultValue={a?.organizer} />
      </label>
      <label className="p-field">
        Status
        <select name="status" defaultValue={a?.status || "akan_datang"}>
          {agendaStatuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="p-checkbox">
        <input type="checkbox" name="confirmed" defaultChecked={a?.confirmed} />
        <span>
          Waktu, tempat, dan penyelenggara sudah diverifikasi. Publikasikan
          agenda ini.
        </span>
      </label>
      {error && <Notice error>{error}</Notice>}
      <div className="p-actions">
        <button className="p-button small" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan Agenda"}
        </button>
        {a && (
          <button
            type="button"
            className="p-text-link p-danger"
            onClick={() => setDeleting(!deleting)}
          >
            Hapus agenda
          </button>
        )}
      </div>
      {deleting && (
        <div className="p-notice error">
          Hapus agenda permanen?{" "}
          <button
            type="button"
            className="p-inline-button"
            disabled={busy}
            onClick={() => void remove()}
          >
            Ya, hapus
          </button>
        </div>
      )}
    </form>
  )
}
function PeriodAdmin() {
  const { data, error, reload } = useLiveData<Period[]>(
      "/api/admin/periods",
      30000
    ),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false)
  async function toggle(p: Period) {
    setBusy(true)
    setMessage("")
    try {
      await api(`/api/admin/periods/${p.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_open: !p.is_open }),
      })
      await reload()
      announceUpdate()
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Status survei belum berhasil diperbarui."
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <h2>Survei 1.0.</h2>
      <p className="p-muted">
        Satu survei dengan 20 pertanyaan. Sudah tersedia untuk warga tanpa
        membuat periode atau mengatur jadwal baru.
      </p>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      {data?.map((p) => (
        <div className="p-admin-list-row" key={p.id}>
          <div>
            <span className="p-badge">
              {p.is_open ? "Dibuka" : "Ditutup"} · v{p.survey_version}
            </span>
            <h3>{p.title}</h3>
          </div>
          <button
            className="p-text-link"
            disabled={busy}
            onClick={() => void toggle(p)}
          >
            {p.is_open ? "Tutup survei" : "Buka survei"}
          </button>
        </div>
      ))}
    </>
  )
}
function AccessAdmin() {
  const { data, error, reload } = useLiveData<
      (Admin & { created_at: string })[]
    >("/api/admin/admins", 30000),
    [message, setMessage] = useState("")
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    try {
      await api("/api/admin/admins", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      form.reset()
      await reload()
      setMessage("Akses berhasil ditambahkan.")
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Akses belum ditambahkan.")
    }
  }
  async function revoke(a: Admin) {
    try {
      await api(`/api/admin/admins/${a.id}`, { method: "DELETE", body: "{}" })
      await reload()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Pencabutan gagal.")
    }
  }
  return (
    <>
      <h2>Akses admin.</h2>
      <p className="p-muted">
        Buat akun pengguna melalui Supabase Auth terlebih dahulu, lalu tambahkan
        ID-nya. Peran owner dikelola melalui SQL Editor.
      </p>
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <form className="p-form-panel p-admin-editor" onSubmit={add}>
        <label className="p-field">
          Auth User ID
          <input name="auth_user_id" required minLength={36} maxLength={36} />
        </label>
        <label className="p-field">
          Peran
          <select name="role">
            <option value="agenda">Pengelola agenda</option>
            <option value="feedback">Pembaca aspirasi</option>
          </select>
        </label>
        <button className="p-button small">Tambahkan Akses</button>
      </form>
      {data?.map((a) => (
        <div className="p-admin-list-row" key={a.id}>
          <div>
            <span className="p-badge">{a.role}</span>
            <p className="p-mono">{a.auth_user_id}</p>
          </div>
          {a.role !== "owner" && (
            <button
              className="p-text-link p-danger"
              onClick={() => void revoke(a)}
            >
              Cabut akses
            </button>
          )}
        </div>
      ))}
    </>
  )
}

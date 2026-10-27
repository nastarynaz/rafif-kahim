"use client"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowUpRight,
  BarChart3,
  Clock3,
  Info,
  Radio,
  RefreshCw,
} from "lucide-react"
import { useLiveData } from "@/hooks/use-live-data"
import { aspects, targets, type Results } from "@/lib/platform-content"
import { Notice, PageIntro } from "./platform-shell"

export function ResultsPage() {
  const [category, setCategory] = useState(""),
    [aspect, setAspect] = useState("")
  const query = new URLSearchParams({
    resource: "results",
    ...(category ? { category } : {}),
  })
  const { data, error, loading, reload, syncedAt } = useLiveData<Results>(
    `/api/public?${query}`,
    15000
  )
  const rows = aspects
    .filter((a) => !aspect || a.id === aspect)
    .map((a) => ({ ...a, score: data?.aspects.find((s) => s.aspect === a.id) }))
  const publishable =
    data?.aspects
      .filter((a) => !a.suppressed && a.average !== null)
      .sort((a, b) => (b.average || 0) - (a.average || 0)) || []
  const name = (id: string) => aspects.find((a) => a.id === id)?.short || id
  const updated = data?.updated_at
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(data.updated_at))
    : "Belum ada respons"
  return (
    <>
      <PageIntro
        headingLevel={2}
        eyebrow="04 / HASIL SURVEI"
        title="Yang kita dengar"
        italic="dari warga."
      >
        Ringkasan penilaian warga yang berpartisipasi. Jawaban individual tetap
        privat.
      </PageIntro>
      <section className="p-container p-section-bottom">
        <div className="p-dashboard-topline">
          <span className={error ? "p-live-status offline" : "p-live-status"}>
            <Radio size={14} />
            {error
              ? "Sinkronisasi tertunda"
              : "Pembaruan otomatis setiap 15 detik"}
          </span>
          <button className="p-text-link" onClick={() => void reload()}>
            <RefreshCw size={14} />
            Segarkan data
          </button>
        </div>
        {error && (
          <Notice error>
            {data
              ? "Koneksi terputus. Menampilkan data terakhir sambil mencoba sinkronisasi kembali."
              : error}
          </Notice>
        )}
        <div className="p-stat-grid">
          <div className="p-stat-card">
            <span>RESPONDEN VALID</span>
            <strong>
              {loading && !data ? "—" : (data?.total ?? "—")}
              <small>orang</small>
            </strong>
            <p>
              {category
                ? "Pada kategori yang memenuhi ambang privasi"
                : "Survei 1.0"}
            </p>
          </div>
          <div className="p-stat-card">
            <span>ASPEK DAPAT DITAMPILKAN</span>
            <strong>
              {data ? publishable.length : "—"}
              <small>/ 10 aspek</small>
            </strong>
            <p>Minimal 5 responden valid per aspek</p>
          </div>
          <div className="p-stat-card update">
            <span>RESPONS TERBARU</span>
            <strong>
              <Clock3 size={22} />
              {updated}
            </strong>
            <p>
              {syncedAt
                ? `Terakhir diperiksa ${new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date(syncedAt))} WIB`
                : "Menunggu koneksi layanan"}
            </p>
          </div>
        </div>
        <div className="p-result-filters">
          <label className="p-field">
            Aspek
            <select value={aspect} onChange={(e) => setAspect(e.target.value)}>
              <option value="">Semua aspek</option>
              {aspects.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.short}
                </option>
              ))}
            </select>
          </label>
          <label className="p-field">
            Konteks penilaian
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Semua konteks</option>
              {targets.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        {loading && !data ? (
          <div className="p-skeleton tall" aria-label="Memuat hasil survei" />
        ) : !data || !data.total ? (
          <div className="p-empty p-results-empty">
            <BarChart3 size={42} strokeWidth={1} />
            <h2>
              {category
                ? "Belum cukup suara untuk kelompok ini."
                : "Setiap suara punya awal."}
            </h2>
            <p>
              {category
                ? "Detail kelompok hanya ditampilkan setelah memenuhi ambang privasi. Coba lihat semua konteks penilaian."
                : "Belum ada hasil yang bisa ditampilkan. Kami menunggu pengalaman pertama warga, tanpa mengisi grafik dengan data buatan."}
            </p>
            <Link className="p-button" href="/#survei">
              Bagikan Pengalamanmu <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="p-chart-panel">
              <div className="p-chart-title">
                <div>
                  <span className="p-eyebrow">MEMBACA PENGALAMAN WARGA</span>
                  <h2>Rata-rata setiap aspek.</h2>
                </div>
                <span className="p-badge">Skala 1–5</span>
              </div>
              <p className="p-muted p-small">
                Arahkan kursor atau fokuskan batang untuk melihat rinciannya.
                N/A tidak masuk perhitungan.
              </p>
              <div className="p-bars">
                {rows.map(({ id, short, score }) => (
                  <div className="p-bar-row" key={id}>
                    <div className="p-bar-label">
                      <span>{short}</span>
                      <strong>
                        {score && !score.suppressed
                          ? Number(score.average).toFixed(2)
                          : "—"}
                      </strong>
                    </div>
                    <div
                      className="p-bar-track"
                      tabIndex={score && !score.suppressed ? 0 : undefined}
                      role="img"
                      aria-label={`${short}: ${score && !score.suppressed ? `${score.average} dari 5, ${score.respondents} responden, ${score.valid_answers} jawaban valid` : `belum cukup respons valid`}`}
                      title={
                        score && !score.suppressed
                          ? `${score.respondents} responden · ${score.valid_answers} jawaban valid · ${score.na_answers} N/A`
                          : "Minimal 5 responden yang memberi nilai valid diperlukan"
                      }
                    >
                      <span
                        style={{
                          width: `${score && !score.suppressed ? (score.average || 0) * 20 : 0}%`,
                        }}
                      />
                    </div>
                    <small>
                      {score && !score.suppressed
                        ? `${score.respondents} responden · ${score.valid_answers} jawaban valid`
                        : "Menunggu minimal 5 responden valid"}
                    </small>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-chart-panel">
              <div className="p-chart-title">
                <div>
                  <span className="p-eyebrow">DI BALIK RATA-RATA</span>
                  <h2>Distribusi penilaian.</h2>
                </div>
                <div className="p-chart-legend">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n}>
                      <i className={`score-${n}`} />
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              {rows.map(({ id, short, score }) => (
                <div className="p-distribution" key={id}>
                  <div>
                    <strong>{short}</strong>
                    <small>
                      {score && !score.suppressed
                        ? `${score.na_answers} jawaban N/A di luar skor`
                        : "Data belum ditampilkan"}
                    </small>
                  </div>
                  <div
                    className="p-stacked-bar"
                    role="img"
                    aria-label={`${short}: ${score && !score.suppressed ? score.distribution.map((n, i) => `nilai ${i + 1}: ${n} jawaban`).join(", ") : "belum cukup respons"}`}
                  >
                    {score &&
                      !score.suppressed &&
                      score.distribution.map(
                        (n, i) =>
                          n > 0 && (
                            <span
                              key={i}
                              className={`score-${i + 1}`}
                              style={{
                                width: `${(n / score.valid_answers) * 100}%`,
                              }}
                              tabIndex={0}
                              title={`Nilai ${i + 1}: ${n} jawaban (${Math.round((n / score.valid_answers) * 100)}%)`}
                            >
                              {n / score.valid_answers > 0.1 ? n : ""}
                            </span>
                          )
                      )}
                  </div>
                </div>
              ))}
            </div>
            {publishable.length >= 2 &&
              publishable[0].average !==
                publishable[publishable.length - 1].average && (
                <div className="p-insight-grid">
                  <div>
                    <span className="p-eyebrow">PENILAIAN RELATIF BAIK</span>
                    <h3>{name(publishable[0].aspect)}</h3>
                    <p>
                      Menjadi kekuatan yang dapat terus dirawat. Hasil ini
                      berasal dari responden yang berpartisipasi.
                    </p>
                  </div>
                  <div>
                    <span className="p-eyebrow">RUANG UNTUK DIPERKUAT</span>
                    <h3>{name(publishable[publishable.length - 1].aspect)}</h3>
                    <p>
                      Layak didengar lebih lanjut untuk memahami pengalaman di
                      balik angka, tanpa menyimpulkan sebab hanya dari skor.
                    </p>
                  </div>
                </div>
              )}
            {publishable.length >= 2 &&
              publishable[0].average ===
                publishable[publishable.length - 1].average && (
                <Notice>
                  Aspek yang dapat ditampilkan memiliki skor setara. Belum ada
                  dasar untuk membedakan penilaian relatif antar-aspek; setiap
                  pengalaman tetap perlu dibaca sesuai konteks.
                </Notice>
              )}
          </>
        )}
        <details className="p-methodology" open>
          <summary>
            <Info size={18} />
            Cara membaca hasil ini
          </summary>
          <div>
            <p>
              Survei bersifat sukarela dan belum tentu mewakili seluruh warga
              KMTSL. Tidak ada peringkat individu atau klaim bahwa angka ini
              membuktikan baik-buruknya suatu lembaga.
            </p>
            <p>
              Rata-rata aspek dihitung dari seluruh jawaban numerik 1–5 pada dua
              pertanyaan dalam aspek tersebut. Setiap jawaban mempunyai bobot
              sama. Jumlah responden adalah orang yang memiliki minimal satu
              nilai valid pada aspek tersebut; satu orang dapat memberi dua
              jawaban.
            </p>
            <p>
              Pilihan “Belum tahu/Tidak relevan” dipisahkan dari skor. Respons
              tanpa satu pun nilai numerik ditolak. Respons yang ditandai
              dikecualikan tidak dihitung. Skor, distribusi, dan rincian
              kelompok disembunyikan jika kurang dari lima responden valid. Teks
              bebas tidak dipublikasikan.
            </p>
            <p>
              Tidak ada skor keseluruhan: setiap aspek dibaca sesuai konteksnya.
              Data berasal dari backend dan diperiksa ulang otomatis; waktu
              respons terbaru berbeda dari waktu pemeriksaan koneksi.
            </p>
            <Link href="/privasi" className="p-text-link">
              Privasi & pengelolaan data <ArrowUpRight size={15} />
            </Link>
          </div>
        </details>
      </section>
    </>
  )
}

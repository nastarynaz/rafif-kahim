"use client"
import Link from "next/link"
import { Button } from "@/components/shadcn/button"
import { Textarea } from "@/components/shadcn/textarea"
import { NativeSelect } from "@/components/shadcn/native-select"
import { Progress } from "@/components/shadcn/progress"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Send,
  ShieldCheck,
} from "lucide-react"
import { api, announceUpdate, useLiveData } from "@/hooks/use-live-data"
import {
  aspects,
  questionIds,
  targets,
  type Period,
} from "@/lib/platform-content"
import { Notice, PageIntro } from "./platform-shell"

const scale = [
  "Sangat tidak puas",
  "Tidak puas",
  "Cukup puas",
  "Puas",
  "Sangat puas",
]
export function SurveyPage() {
  const {
    data: periods,
    error: periodError,
    loading,
  } = useLiveData<Period[]>("/api/public?resource=periods", 30000)
  const [step, setStep] = useState(-1),
    [ratings, setRatings] = useState<Record<string, number | null>>({}),
    [consent, setConsent] = useState(false),
    [target, setTarget] = useState(""),
    [comments, setComments] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null),
    formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (saved) successRef.current?.focus()
  }, [saved])
  const period = periods?.find((p) => p.is_open)
  const completed = Object.keys(ratings).length,
    currentAspects = aspects.slice(step * 2, step * 2 + 2)
  const move = (next: number) => {
    setStep(next)
    setError("")
    requestAnimationFrame(() => {
      headingRef.current?.focus()
      headingRef.current?.scrollIntoView({
        block: "start",
        behavior: "instant",
      })
    })
  }
  function next() {
    if (step < 0 && !consent) {
      setError(
        "Baca informasi penggunaan data dan berikan persetujuan untuk melanjutkan."
      )
      return
    }
    if (
      step >= 0 &&
      step < 5 &&
      currentAspects.some((a) =>
        a.questions.some((_, i) => ratings[`${a.id}_${i + 1}`] === undefined)
      )
    ) {
      setError(
        "Pilih jawaban untuk setiap pertanyaan. Kamu bisa memilih Belum tahu/Tidak relevan."
      )
      return
    }
    move(step + 1)
  }
  async function submit() {
    if (!period) {
      setError(
        "Survei belum dibuka atau koneksi belum tersedia. Jawaban belum dikirim."
      )
      return
    }
    setBusy(true)
    setError("")
    try {
      await api("/api/survey", {
        method: "POST",
        body: JSON.stringify({
          period_id: period.id,
          ratings,
          target_category: target || null,
          optional_comments: comments,
          consent,
          website: new FormData(formRef.current!).get("website"),
        }),
      })
      setSaved(true)
      announceUpdate()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Pengiriman gagal. Coba kembali."
      )
    } finally {
      setBusy(false)
    }
  }
  if (saved)
    return (
      <section className="p-container p-success-page">
        <div className="p-success-icon">
          <CheckCircle2 size={42} strokeWidth={1.3} />
        </div>
        <span className="p-eyebrow">JAWABAN BERHASIL DISIMPAN</span>
        <h2 tabIndex={-1} ref={successRef}>
          Terima kasih sudah
          <br />
          <em>berbagi perspektif.</em>
        </h2>
        <p>
          Responsmu sudah tersimpan. Hasil publik diperbarui otomatis dan hanya
          menampilkan agregat yang memenuhi ambang privasi.
        </p>
        <div className="p-actions">
          <Link href="/#hasil" className="p-button">
            Lihat Hasil Survei <ArrowUpRightIcon />
          </Link>
          <Link href="/" className="p-text-link">
            Kembali ke beranda
          </Link>
        </div>
      </section>
    )
  return (
    <>
      <PageIntro
        headingLevel={2}
        eyebrow="SURVEI WARGA · 3–5 MENIT"
        title="Bagaimana pengalamanmu"
        italic="di KMTSL?"
      >
        Bantu kami memahami apa yang sudah baik dan apa yang perlu diperbaiki.
      </PageIntro>
      <section className="p-container p-form-layout p-section-bottom">
        <aside className="p-form-aside">
          <div className="p-aside-card">
            <h3>Panduan singkat</h3>
            <ul className="p-icon-list">
              <li>
                <Clock3 size={18} />
                <span>
                  Sekitar 3–5 menit
                  <br />
                  <small>20 pertanyaan, 10 aspek</small>
                </span>
              </li>
              <li>
                <ShieldCheck size={18} />
                <span>
                  Pengisian sukarela
                  <br />
                  <small>Tanpa nama atau NIM wajib</small>
                </span>
              </li>
              <li>
                <LockKeyhole size={18} />
                <span>
                  Hasil berupa agregat
                  <br />
                  <small>Jawaban individual tidak dipublikasikan</small>
                </span>
              </li>
            </ul>
            <Link href="/privasi" className="p-text-link">
              Baca kebijakan privasi <ArrowRight size={15} />
            </Link>
          </div>
          <p className="p-aside-footnote">
            Penilaian sarana tidak mengasumsikan semua fasilitas berada di bawah
            kendali KMTSL. Transfer pengetahuan menilai pengalaman lintas
            angkatan.
          </p>
        </aside>
        <form
          ref={formRef}
          className="p-form-panel"
          onSubmit={(e) => {
            e.preventDefault()
            if (step === 5) void submit()
            else next()
          }}
        >
          <div className="p-honeypot" aria-hidden="true">
            <label htmlFor="survey-website">Website</label>
            <input
              name="website"
              id="survey-website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="p-form-progress">
            <div>
              <span>
                {step < 0
                  ? "SEBELUM KITA MULAI"
                  : step === 5
                    ? "TINJAU JAWABANMU"
                    : `BAGIAN ${step + 1} DARI 5`}
              </span>
              <span>
                {completed}/{questionIds.length} pertanyaan
              </span>
            </div>
            <Progress
              value={(completed / questionIds.length) * 100}
              aria-valuetext={`${completed} dari ${questionIds.length} pertanyaan`}
              aria-label="Progres pengisian survei"
            />
          </div>
          {periodError && (
            <Notice>
              Layanan survei belum terhubung. Kamu dapat membaca pertanyaannya;
              pengiriman akan tersedia setelah layanan siap.
            </Notice>
          )}
          {!loading && !periodError && !period && (
            <Notice>
              Survei 1.0 sedang ditutup. Kamu tetap bisa melihat pertanyaannya.
            </Notice>
          )}
          <div key={step} data-motion-step>
            {step < 0 ? (
              <>
                <h2 tabIndex={-1} ref={headingRef}>
                  Sebelum mulai
                </h2>
                <p>
                  Nilai sesuai pengalamanmu. Jawabanmu menjadi bahan evaluasi
                  KMTSL dan pertimbangan gagasan kami.
                </p>
                <div className="p-information-box">
                  <h3>Bagaimana jawabanmu digunakan?</h3>
                  <ul className="p-survey-guidelines">
                    <li>
                      Hasil berupa rata-rata dan distribusi. Skor aspek atau
                      kelompok tampil setelah ada minimal 5 responden dengan
                      penilaian valid.
                    </li>
                    <li>
                      Belum pernah mengalami? Pilih “Belum tahu/Tidak relevan”.
                      Pilihan ini tidak dihitung sebagai nilai.
                    </li>
                    <li>
                      Catatan terbuka tetap privat. Untuk cerita personal atau
                      keluhan, gunakan{" "}
                      <Link href="/#aspirasi">ruang aspirasi</Link>.
                    </li>
                  </ul>
                </div>
                <label className="p-checkbox">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Saya memahami tujuan survei dan menyetujui pengolahan
                    jawaban sesuai{" "}
                    <Link href="/privasi">kebijakan privasi</Link>. Saya mengisi
                    secara sukarela.
                  </span>
                </label>
              </>
            ) : step < 5 ? (
              <>
                <h2 tabIndex={-1} ref={headingRef}>
                  {
                    [
                      "Relasi & percakapan.",
                      "Informasi & respons.",
                      "Proses & sinergi.",
                      "Bertumbuh & terlibat.",
                      "Akses & kesempatan.",
                    ][step]
                  }
                </h2>
                <p className="p-muted">
                  Pilih yang paling sesuai dengan pengalamanmu. Semua pilihan
                  sama berharganya.
                </p>
                {currentAspects.map((a) => (
                  <section className="p-survey-aspect" key={a.id}>
                    <h3>{a.title}</h3>
                    {a.questions.map((q, i) => {
                      const id = `${a.id}_${i + 1}`
                      return (
                        <fieldset key={id} className="p-rating-question">
                          <legend>{q}</legend>
                          <div className="p-rating-options">
                            {scale.map((label, j) => (
                              <label
                                key={label}
                                className={
                                  ratings[id] === j + 1 ? "selected" : ""
                                }
                              >
                                <input
                                  type="radio"
                                  name={id}
                                  value={j + 1}
                                  checked={ratings[id] === j + 1}
                                  onChange={() =>
                                    setRatings((r) => ({ ...r, [id]: j + 1 }))
                                  }
                                />
                                <strong>{j + 1}</strong>
                                <span>{label}</span>
                              </label>
                            ))}
                          </div>
                          <label
                            className={
                              ratings[id] === null
                                ? "p-na-option selected"
                                : "p-na-option"
                            }
                          >
                            <input
                              type="radio"
                              name={id}
                              checked={ratings[id] === null}
                              onChange={() =>
                                setRatings((r) => ({ ...r, [id]: null }))
                              }
                            />
                            <span>Belum tahu/Tidak relevan</span>
                          </label>
                        </fieldset>
                      )
                    })}
                  </section>
                ))}
              </>
            ) : (
              <>
                <h2 tabIndex={-1} ref={headingRef}>
                  Sudah sesuai
                  <br />
                  <em>dengan pengalamanmu?</em>
                </h2>
                <p>
                  Periksa kembali sebelum mengirim. Jawaban akan disimpan untuk
                  <strong>Survei 1.0</strong>.
                </p>
                <div className="p-review-list">
                  {aspects.map((a, i) => (
                    <div key={a.id}>
                      <div>
                        <strong>{a.short}</strong>
                        <span>
                          {a.questions
                            .map((_, j) =>
                              ratings[`${a.id}_${j + 1}`] === null
                                ? "N/A"
                                : `${ratings[`${a.id}_${j + 1}`]}/5`
                            )
                            .join(" · ")}
                        </span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => move(Math.floor(i / 2))}
                      >
                        Ubah
                      </Button>
                    </div>
                  ))}
                </div>
                <label className="p-field">
                  Konteks penilaian <span>Opsional · kategori umum</span>
                  <NativeSelect
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  >
                    <option value="">Tanpa kategori khusus</option>
                    {targets.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </NativeSelect>
                </label>
                <label className="p-field">
                  Ada yang ingin ditambahkan?{" "}
                  <span>Opsional · tidak dipublikasikan</span>
                  <Textarea
                    value={comments}
                    maxLength={2000}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Catatan singkat, tanpa data pribadi pihak lain…"
                    rows={3}
                  />
                </label>
                <p className="p-small p-muted">
                  Setidaknya satu penilaian numerik diperlukan agar respons
                  dapat diolah. Satu respons per browser untuk Survei 1.0;
                  pembatasan ini bukan verifikasi identitas warga.
                </p>
              </>
            )}
          </div>
          {error && <Notice error>{error}</Notice>}
          <div className="p-form-navigation">
            {step >= 0 ? (
              <Button
                type="button"
                className="p-text-link"
                onClick={() => move(step - 1)}
                disabled={busy}
              >
                <ArrowLeft size={16} />
                Kembali
              </Button>
            ) : (
              <span />
            )}
            <Button
              className="p-button"
              type="submit"
              disabled={busy || (step === 5 && !period)}
            >
              {busy
                ? "Menyimpan jawaban…"
                : step < 0
                  ? "Mulai Berbagi"
                  : step === 5
                    ? "Kirim Jawaban"
                    : "Lanjutkan"}
              {step === 5 ? <Send size={16} /> : <ArrowRight size={16} />}
            </Button>
          </div>
          <span className="p-form-bottom-note">
            <Check size={13} /> Jawaban belum dikirim sampai kamu menekan Kirim
            Jawaban.
          </span>
        </form>
      </section>
    </>
  )
}
function ArrowUpRightIcon() {
  return <ArrowRight size={18} />
}

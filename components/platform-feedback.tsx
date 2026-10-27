"use client"
import Link from "next/link"
import { Button } from "@/components/shadcn/button"
import { Textarea } from "@/components/shadcn/textarea"
import { NativeSelect } from "@/components/shadcn/native-select"
import { Input } from "@/components/shadcn/input"

import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  HeartHandshake,
  LockKeyhole,
  Send,
  ShieldCheck,
} from "lucide-react"
import { api, useLiveData } from "@/hooks/use-live-data"
import { categories } from "@/lib/platform-content"
import { Notice, PageIntro } from "./platform-shell"

export function FeedbackPage() {
  const { data: status } = useLiveData<{
    configured: boolean
    readers: string
    retention_days: number
  }>("/api/public?resource=status", 60000)
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [receipt, setReceipt] = useState<{
      receipt: string
      deletion_code: string
    } | null>(null),
    [copied, setCopied] = useState(false)
  const successRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (receipt) successRef.current?.focus()
  }, [receipt])
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      const saved = await api<{ receipt: string; deletion_code: string }>(
        "/api/feedback",
        {
          method: "POST",
          body: JSON.stringify({
            ...Object.fromEntries(data),
            consent: data.get("consent") === "on",
          }),
        }
      )
      setReceipt(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pengiriman belum berhasil.")
    } finally {
      setBusy(false)
    }
  }
  if (receipt)
    return (
      <section className="p-container p-success-page">
        <div className="p-success-icon">
          <CheckCircle2 size={42} strokeWidth={1.3} />
        </div>
        <span className="p-eyebrow">PESAN BERHASIL DISIMPAN</span>
        <h2 tabIndex={-1} ref={successRef}>
          Ceritamu
          <br />
          <em>sudah kami terima.</em>
        </h2>
        <p>
          Pesan tidak ditampilkan kepada publik. Simpan bukti dan kode berikut
          untuk meminta penghapusan tanpa memberikan identitas tambahan.
        </p>
        <div className="p-receipt">
          <span>Nomor pesan</span>
          <code>{receipt.receipt}</code>
          <span>Kode penghapusan · simpan secara pribadi</span>
          <code>{receipt.deletion_code}</code>
          <Button
            className="p-text-link"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `Nomor pesan: ${receipt.receipt}\nKode penghapusan: ${receipt.deletion_code}`
                )
                setCopied(true)
              } catch {
                setError("Salin kode secara manual dari kotak ini.")
              }
            }}
          >
            <Copy size={16} />
            {copied ? "Kode disalin" : "Salin bukti penerimaan"}
          </Button>
        </div>
        {error && <Notice error>{error}</Notice>}
        <div className="p-actions">
          <Link href="/privasi#hapus" className="p-button">
            Kelola penghapusan pesan <ArrowRight size={17} />
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
        eyebrow="RUANG ASPIRASI · PESAN PRIVAT"
        title="Ceritamu"
        italic="punya ruang."
      >
        Tulis yang kamu alami dan perubahan yang kamu harapkan.
      </PageIntro>
      <section className="p-container p-form-layout p-section-bottom">
        <aside className="p-form-aside">
          <div className="p-aside-card">
            <HeartHandshake size={38} strokeWidth={1.2} />
            <h3>Mulai dari yang kamu alami.</h3>
            <p>Apa yang terjadi? Apa dampaknya? Apa harapanmu setelah ini?</p>
            <ul className="p-icon-list">
              <li>
                <LockKeyhole size={18} />
                <span>Pesan tidak dipublikasikan.</span>
              </li>
              <li>
                <ShieldCheck size={18} />
                <span>Identitas dan kontak opsional.</span>
              </li>
            </ul>
          </div>
          <p className="p-aside-footnote">
            Ruang ini bukan layanan darurat dan tidak dipantau setiap saat.
            Untuk bantuan mendesak, hubungi layanan bantuan yang sesuai.
          </p>
        </aside>
        <form className="p-form-panel" onSubmit={submit}>
          <div className="p-panel-top">
            <span className="p-eyebrow">FORMULIR ASPIRASI</span>
            <LockKeyhole size={18} />
          </div>
          <h2>Mulai dari ceritamu.</h2>
          <p>
            Isi pesan hanya dapat dibaca oleh{" "}
            <strong>
              {status?.readers ||
                "Rafif dan admin aspirasi yang diberi wewenang"}
            </strong>
            , untuk memahami dan meninjau masukan warga.
          </p>
          {status && !status.configured && (
            <Notice>
              Layanan pengiriman belum terhubung. Kamu dapat melihat formulir;
              pesan belum dapat dikirim.
            </Notice>
          )}
          <div className="p-honeypot" aria-hidden="true">
            <label htmlFor="feedback-website">Website</label>
            <input
              id="feedback-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <label className="p-field">
            Tentang apa ceritamu?
            <NativeSelect name="category" required defaultValue="">
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </NativeSelect>
          </label>
          <label className="p-field">
            Subjek <span>Opsional</span>
            <Input
              name="subject"
              maxLength={160}
              placeholder="Satu kalimat tentang ceritamu"
            />
          </label>
          <label className="p-field">
            Apa yang ingin kamu ceritakan?
            <Textarea
              name="message"
              minLength={10}
              maxLength={6000}
              rows={6}
              required
              placeholder="Ceritakan apa yang kamu alami dan perubahan yang kamu harapkan…"
            />
            <small>
              10–6.000 karakter. Hindari data pribadi pihak lain yang tidak
              diperlukan.
            </small>
          </label>
          <label className="p-field">
            Apa harapanmu setelah ini? <span>Opsional</span>
            <Textarea
              name="requested_follow_up"
              maxLength={2000}
              rows={3}
              placeholder="Tindak lanjut atau perubahan yang kamu harapkan"
            />
          </label>
          <label className="p-field">
            Nama atau kontak yang bisa dihubungi <span>Opsional</span>
            <Input
              name="identity_contact"
              maxLength={200}
              placeholder="Isi hanya jika kamu ingin dapat dihubungi"
            />
          </label>
          <label className="p-checkbox">
            <input name="consent" type="checkbox" required />
            <span>
              Saya menyetujui pengelolaan pesan untuk evaluasi dan tindak lanjut
              sesuai <Link href="/privasi">kebijakan privasi</Link>. Pesan
              memiliki batas retensi 180 hari, dihapus melalui jadwal harian,
              dan dapat diminta untuk dihapus lebih awal.
            </span>
          </label>
          {error && <Notice error>{error}</Notice>}
          <Button
            className="p-button p-full-button"
            type="submit"
            disabled={busy || status?.configured === false}
          >
            {busy ? "Menyimpan ceritamu…" : "Kirim Cerita"}
            <Send size={17} />
          </Button>
          <p className="p-form-bottom-note">
            <LockKeyhole size={13} /> Isian belum dikirim sampai kamu menekan
            Kirim Cerita.
          </p>
        </form>
      </section>
    </>
  )
}

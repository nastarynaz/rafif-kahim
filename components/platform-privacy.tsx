"use client"
import { useState } from "react"
import { LockKeyhole, Trash2 } from "lucide-react"
import { api, useLiveData } from "@/hooks/use-live-data"
import { Notice, PageIntro } from "./platform-shell"

export function PrivacyPage() {
  const { data } = useLiveData<{ readers: string }>(
    "/api/public?resource=status",
    60000
  )
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false)
  async function remove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError("")
    try {
      await api("/api/feedback", {
        method: "DELETE",
        body: JSON.stringify(Object.fromEntries(form)),
      })
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Permintaan gagal.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="PRIVASI & PENGGUNAAN DATA"
        title="Kepercayaanmu,"
        italic="tanggung jawab kami."
      >
        Kami mengumpulkan data seperlunya dan menjelaskan bagaimana data
        digunakan. Halaman ini berlaku untuk survei dan ruang aspirasi
        Rafif–Dewa.
      </PageIntro>
      <section className="p-container p-privacy-layout p-section-bottom">
        <article className="p-prose">
          <h2>Yang dikumpulkan</h2>
          <p>
            Survei menyimpan penilaian, periode, kategori umum opsional, catatan
            opsional, waktu kirim, dan persetujuan. Kami tidak meminta nama,
            NIM, atau kontak untuk survei. Aspirasi menyimpan kategori, pesan,
            harapan, serta subjek dan kontak yang kamu isi secara sukarela.
          </p>
          <h2>Siapa yang dapat membaca?</h2>
          <p>
            Pesan aspirasi hanya dapat dibaca oleh{" "}
            <strong>
              {data?.readers || "Rafif dan admin aspirasi yang diberi wewenang"}
            </strong>
            . Izin tersebut terpisah dari admin agenda. Pengelola teknis dengan
            akses infrastruktur/database dapat memiliki akses operasional;
            karena itu kami tidak menjanjikan anonimitas atau kerahasiaan
            absolut.
          </p>
          <p>
            Catatan survei tidak dipublikasikan. Hasil publik hanya berupa
            agregat yang memenuhi ambang privasi, jumlah respons, dan metadata
            pembaruan. Isi aspirasi tidak dipakai sebagai testimoni atau kutipan
            tanpa persetujuan eksplisit.
          </p>
          <h2>Tujuan dan batas penggunaan</h2>
          <p>
            Masukan digunakan untuk memahami pengalaman warga, evaluasi, dan
            mempertimbangkan tindak lanjut sesuai kewenangan serta sumber daya.
            Survei sukarela tidak otomatis mewakili seluruh warga dan bukan
            sarana pemeringkatan individu.
          </p>
          <h2>Masa penyimpanan</h2>
          <p>
            Batas retensi aspirasi adalah 180 hari. Pesan yang melewati tenggat
            tidak ditampilkan ke admin dan dihapus melalui pekerjaan retensi
            harian setelah layanan dikonfigurasi. Catatan tindakan admin
            memiliki batas retensi 365 hari dan dihapus melalui jadwal harian.
            Riwayat survei dipertahankan untuk membaca hasil per periode;
            pengelola perlu meninjau kebutuhan penyimpanannya pada akhir periode
            kepengurusan.
          </p>
          <h2>Cookie dan pencegahan spam</h2>
          <p>
            Cookie pihak pertama menyimpan pengenal acak untuk membatasi satu
            respons per browser per periode. Hash pengenal disimpan bersama
            respons; cookie berlaku paling lama satu tahun. Pembatasan ini dapat
            dilewati dengan mengganti browser dan bukan bukti keanggotaan atau
            identitas.
          </p>
          <p>
            Pembatasan spam memakai hash alamat jaringan yang berubah setiap
            hari; alamat IP mentah tidak disimpan oleh aplikasi. Catatan
            pembatasan kadaluwarsa dihapus melalui pekerjaan harian. Penyedia
            hosting dapat memiliki log infrastruktur sesuai kebijakannya. Sesi
            admin memakai cookie HttpOnly maksimal satu jam.
          </p>
          <h2>Penghapusan dan pertanyaan</h2>
          <p>
            Simpan nomor pesan dan kode penghapusan yang muncul sesudah mengirim
            aspirasi. Gunakan formulir di samping untuk meminta penghapusan.
            Kode tidak dapat dipulihkan; jika kode hilang, hubungi Rafif melalui{" "}
            <a href="https://www.instagram.com/rafifth/">@rafifth</a> tanpa
            mengirim ulang data sensitif. Penghapusan cadangan mengikuti siklus
            penyedia infrastruktur.
          </p>
          <p>
            Jangan menyertakan data pribadi pihak lain yang tidak diperlukan.
            Ruang ini bukan layanan darurat. Kebijakan terakhir diperbarui 26
            Oktober 2026.
          </p>
        </article>
        <aside id="hapus" className="p-form-panel p-delete-panel">
          <LockKeyhole size={29} strokeWidth={1.3} />
          <h2>Kelola pesanmu.</h2>
          <p>
            Hapus aspirasi menggunakan bukti penerimaan. Isi pesan tidak akan
            ditampilkan di sini.
          </p>
          {done ? (
            <Notice>
              Permintaan sudah diproses. Jika nomor pesan dan kode cocok, pesan
              telah dihapus. Respons ini juga berlaku untuk pesan yang sudah
              tidak ada.
            </Notice>
          ) : (
            <form onSubmit={remove}>
              <label className="p-field">
                Nomor pesan
                <input
                  name="receipt"
                  required
                  minLength={36}
                  maxLength={36}
                  autoComplete="off"
                />
              </label>
              <label className="p-field">
                Kode penghapusan
                <input
                  name="deletion_code"
                  type="password"
                  required
                  minLength={48}
                  maxLength={48}
                  autoComplete="off"
                />
              </label>
              {error && <Notice error>{error}</Notice>}
              <button className="p-button" disabled={busy}>
                {busy ? "Memproses…" : "Hapus Pesan"}
                <Trash2 size={16} />
              </button>
            </form>
          )}
        </aside>
      </section>
    </>
  )
}

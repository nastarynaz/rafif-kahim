"use client"

import { useState, type FormEvent } from "react"
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Menu,
  X,
  Plus,
  Download,
  Check,
  MoveUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
} from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPanel,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import AnimatedContent from "@/components/react-bits/animated-content"
import { CampaignStories, CampaignContact } from "@/components/campaign-stories"
import {
  candidates,
  programs,
  faqs,
  vision,
  missions,
} from "@/lib/campaign-content"

const links = [
  { href: "#arah", label: "Visi & misi" },
  { href: "#kenalan", label: "Pasangan" },
  { href: "#program", label: "Gagasan program" },
  { href: "#kontak", label: "Kontak" },
]

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="38"
      height="38"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 32V17L20 5l15 12v15H5Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M12 32V20l8-6 8 6v12M20 14v18M5 25h30"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  )
}

function BridgeDrawing() {
  return (
    <svg
      viewBox="0 0 640 480"
      fill="none"
      className="bridge-drawing"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="technical-grid"
          width="28"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M28 0H0V28"
            stroke="currentColor"
            strokeWidth=".4"
            opacity=".2"
          />
        </pattern>
      </defs>
      <rect width="640" height="480" fill="url(#technical-grid)" />
      <g stroke="currentColor" strokeWidth="1.2" opacity=".4">
        <path
          d="M30 374 581 191M51 421 611 234M100 113v294M535 73v238"
          strokeDasharray="5 6"
        />
        <path d="m62 395 35 20m-35-20 454-151m-13-11 26 22" />
        <path d="M76 386v28m0-28 7 8m-7-8-7 13" />
      </g>
      <g stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
        <path d="m79 335 435-145 63 40-436 145Z" fill="var(--paper)" />
        <path d="M79 335v15l62 40 436-145v-15M141 375v15M105 350l436-146M123 362l436-146" />
        <path
          d="m164 370 0 65 17-6v-65m-17 53 17-6M468 269v61l17-6v-61m-17 50 17-6"
          fill="var(--paper)"
        />
        <path
          d="M113 324V203l24-8v121m-24-113 48 32v121m-24-161 48 32v121m-24-113 24-8M113 235l24-8m-24 21 24-8m24 19 24-8m-24 21 24-8"
          fill="var(--paper)"
        />
        <path
          d="M451 211V90l24-8v121m-24-113 48 32v121m-24-161 48 32v121m-24-113 24-8M451 122l24-8m-24 21 24-8m24 19 24-8m-24 21 24-8"
          fill="var(--paper)"
        />
        <path
          d="M70 336q23-47 55-134 149 114 337-108 35 82 85 145M132 371q13-68 41-135 146 116 337-110 27 64 82 118"
          strokeWidth="3"
        />
        <path d="M195 247v51m32-41v30m33-26v15m32-17v7m33-21v11m32-31v20m33-49v38m32-74v63M226 282v58m32-49v38m33-39v28m32-32v22m33-35v24m32-48v37m33-63v52m32-83v72" />
      </g>
      <g fill="currentColor">
        <circle cx="125" cy="202" r="4" />
        <circle cx="462" cy="94" r="4" />
        <circle cx="173" cy="236" r="4" />
        <circle cx="510" cy="126" r="4" />
      </g>
      <g stroke="currentColor" opacity=".6">
        <path d="M462 77V45h85M202 299l-36-45H49M308 348v68h91" />
        <circle cx="308" cy="348" r="3" />
      </g>
      <g
        fill="currentColor"
        fontSize="10"
        fontFamily="monospace"
        letterSpacing="1"
      >
        <text x="549" y="48">
          ARAH
        </text>
        <text x="24" y="247">
          SUARA
        </text>
        <text x="405" y="420">
          BERSAMA
        </text>
        <text x="220" y="398" transform="rotate(-18 220 398)">
          MENGHUBUNGKAN POTENSI
        </text>
      </g>
    </svg>
  )
}

export function Campaign() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<number | null>(null)
  const [topic, setTopic] = useState("Kehidupan kampus")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [prepared, setPrepared] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [error, setError] = useState("")
  function prepare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (message.trim().length < 10) {
      setError("Tulis sedikitnya 10 karakter supaya gagasanmu lebih jelas.")
      return
    }
    setError("")
    setPrepared(true)
    setDownloaded(false)
  }
  function download() {
    const text = `CATATAN ASPIRASI — DEMO RAFIF & DEWA\nBelum dikirim ke tim kampanye.\n\nNama: ${name.trim() || "Tanpa nama"}\nTopik: ${topic}\n\n${message.trim()}\n`
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" })
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "catatan-aspirasi.txt"
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setDownloaded(true)
  }
  return (
    <>
      <a href="#utama" className="skip-link">
        Lewati ke konten
      </a>
      <div className="draft-strip">
        <span className="draft-dot" /> KONSEP KAMPANYE{" "}
        <span className="draft-strip-note">
          — gagasan program masih dalam pengembangan
        </span>
        <span className="draft-edition">KMTSL UGM / EDISI PERKENALAN</span>
      </div>
      <header className="site-header">
        <a href="#" className="brand" aria-label="Rafif dan Dewa, beranda">
          <Mark />
          <span>
            RAFIF<span className="brand-plus"> + </span>DEWA
            <small>SATU RUMAH, BANYAK SUARA.</small>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <Button render={<a href="#aspirasi" />} className="nav-cta">
          Titip suara <ArrowUpRight />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="mobile-toggle"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
        {menuOpen && (
          <nav
            id="mobile-menu"
            className="mobile-nav"
            aria-label="Navigasi seluler"
          >
            {[...links, { href: "#aspirasi", label: "Titip suara" }].map(
              (link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <ArrowUpRight size={18} />
                </a>
              )
            )}
          </nav>
        )}
      </header>
      <main id="utama">
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-meta">
            <span>
              <span className="small-cross">+</span> BERANGKAT DARI KITA, UNTUK
              KITA.
            </span>
            <span>YOGYAKARTA, INDONESIA</span>
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">RAFIF & DEWA UNTUK KMTSL UGM</div>
              <h1 id="hero-title">
                Satu rumah.
                <br />
                <span>Banyak</span>
                <br />
                <span className="last-word">
                  suara.
                  <svg viewBox="0 0 300 16" aria-hidden="true">
                    <path
                      d="M3 11Q138-3 294 7M25 15Q156 5 274 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                  </svg>
                </span>
              </h1>
              <p>
                Tempat untuk didengar. Ruang untuk bertumbuh.
                <br className="desktop-break" /> Langkah yang kita bangun
                bersama.
              </p>
              <div className="hero-actions">
                <Button render={<a href="#arah" />} className="primary-action">
                  Baca visi & misi <ArrowUpRight />
                </Button>
                <a href="#kenalan" className="text-link">
                  Kenalan dulu <ArrowDown size={15} />
                </a>
              </div>
            </div>
            <AnimatedContent className="hero-art" delay={0.12}>
              <div className="drawing-topline">
                <span>GAGASAN 001</span>
                <span>
                  SEBUAH TITIK TEMU <Plus size={12} />
                </span>
              </div>
              <div className="drawing-circle" />
              <BridgeDrawing />
              <div className="art-sticker">
                Beda cerita.
                <br />
                Satu keluarga.<span>↗</span>
              </div>
              <div className="drawing-caption">
                <span>
                  STRUKTUR YANG KUAT
                  <br />
                  DIMULAI DARI KETERHUBUNGAN.
                </span>
                <span className="drawing-scale">1 : KITA</span>
              </div>
            </AnimatedContent>
          </div>
          <div className="hero-bottom">
            <span>
              KELUARGA MAHASISWA TEKNIK SIPIL DAN LINGKUNGAN
              <br />
              <strong>UNIVERSITAS GADJAH MADA</strong>
            </span>
            <a href="#kenalan">
              MULAI DARI KENAL{" "}
              <span>
                <ArrowDown size={19} />
              </span>
            </a>
          </div>
        </section>
        <div className="values-ribbon" aria-label="Nilai kampanye">
          <span>TERBUKA</span>
          <span aria-hidden="true">✳</span>
          <span>SUPORTIF</span>
          <span aria-hidden="true">✳</span>
          <span>BERINTEGRITAS</span>
          <span aria-hidden="true">✳</span>
        </div>
        <section
          id="arah"
          className="direction-section section-space"
          aria-labelledby="vision-title"
        >
          <div className="section-shell">
            <div className="section-label">
              <span>01 / VISI & MISI</span>
              <span>ARAH YANG KITA TUJU</span>
            </div>
            <div className="vision-layout">
              <div className="vision-aside">
                <h2 id="vision-title" className="eyebrow">
                  VISI KAMI
                </h2>
                <Mark />
                <span>
                  Rumah bersama.
                  <br />
                  Tumbuh bersama.
                </span>
              </div>
              <div className="vision-statement">
                <p className="vision-prelude">
                  Perubahan ini dimulai dari satu visi.
                </p>
                <blockquote>{vision}</blockquote>
                <a href="#misi" className="text-link">
                  Lima misi untuk mewujudkannya <ArrowDown size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
        <section
          id="misi"
          className="missions-section section-shell section-space"
          aria-labelledby="missions-title"
        >
          <div className="missions-intro">
            <span className="eyebrow">MISI KAMI</span>
            <h2 id="missions-title">
              Lima misi.
              <br />
              <em>Satu tujuan.</em>
            </h2>
            <p>
              Menjadikan KMTSL rumah yang memberi setiap individu tempat, peran,
              dan kesempatan untuk bertumbuh.
            </p>
            <a href="#program" className="text-link">
              Jelajahi gagasan program <ArrowDown size={17} />
            </a>
          </div>
          <ol className="mission-list">
            {missions.map((mission) => (
              <li
                key={mission.id}
                id={`misi-${mission.number}`}
                className="mission-row"
              >
                <span className="mission-number" aria-hidden="true">
                  {mission.number}
                </span>
                <div>
                  <h3>{mission.title}</h3>
                  <p>{mission.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section
          id="kenalan"
          className="section-shell introduction section-space"
        >
          <div className="section-label">
            <span>02 / KENALAN DULU</span>
            <span>DUA PERAN, SATU ARAH</span>
          </div>
          <AnimatedContent>
            <div className="section-heading">
              <h2>
                Halo, kami
                <br />
                Rafif <em>&</em> Dewa<span className="red-dot">.</span>
              </h2>
              <div>
                <p>
                  Kami ingin memulai dari hal sederhana:
                  <br />
                  mengenal, mendengar, lalu bekerja bersama.
                </p>
                <p className="muted-note">
                  Konsep peran di bawah adalah draft pengenalan.
                  <br />
                  Cerita personal dan rekam jejak akan dilengkapi.
                </p>
              </div>
            </div>
          </AnimatedContent>
          <div className="candidate-grid">
            {candidates.map((candidate, index) => (
              <AnimatedContent key={candidate.short} delay={index * 0.08}>
                <article className={`candidate candidate-${index}`}>
                  <div className="candidate-art">
                    <span className="candidate-index">
                      {index === 0 ? "KETUA HIMPUNAN" : "SEKRETARIS JENDERAL"}
                    </span>
                    <span className="candidate-monogram" aria-hidden="true">
                      {candidate.initials}
                    </span>
                    <span className="candidate-direction" aria-hidden="true">
                      ↗
                    </span>
                    <span className="portrait-note">
                      RUANG POTRET · FOTO MENYUSUL
                    </span>
                    <Mark className="portrait-mark" />
                  </div>
                  <div className="candidate-info">
                    <div>
                      <span className="eyebrow">{candidate.role}</span>
                      <h3>{candidate.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xl"
                      aria-label={`Kenali ${candidate.short}`}
                      className="profile-button"
                      onClick={() => setProfile(index)}
                    >
                      <ArrowUpRight />
                    </Button>
                  </div>
                  <p className="candidate-focus">{candidate.focus}</p>
                </article>
              </AnimatedContent>
            ))}
          </div>
          <CampaignStories />
        </section>
        <section
          id="program"
          className="program-section section-space"
          aria-labelledby="program-title"
        >
          <div className="section-shell">
            <div className="section-label">
              <span>03 / GAGASAN PROGRAM</span>
              <span>BAHAN DISKUSI BERSAMA</span>
            </div>
            <div className="section-heading">
              <h2 id="program-title">
                Dari arah bersama,
                <br />
                ke langkah nyata.
              </h2>
              <p>
                Beberapa gagasan awal untuk menerjemahkan misi ke dalam
                kegiatan. Rinciannya masih terbuka untuk dikembangkan bersama.
              </p>
            </div>
            <Tabs defaultValue="dengar" className="program-tabs">
              <TabsList
                aria-label="Kelompok gagasan program"
                variant="underline"
                className="program-tab-list"
              >
                {programs.map((p) => (
                  <TabsTab key={p.id} value={p.id} className="program-tab">
                    <span>{p.number}</span>
                    {p.label}
                    <ArrowUpRight size={20} />
                  </TabsTab>
                ))}
              </TabsList>
              {programs.map((p) => (
                <TabsPanel key={p.id} value={p.id} className="program-panel">
                  <div className="program-summary">
                    <span className="eyebrow">GAGASAN {p.number}</span>
                    <h3>{p.title}</h3>
                    <p>{p.intro}</p>
                    <span className="draft-tag">USULAN UNTUK DIDISKUSIKAN</span>
                  </div>
                  <Accordion
                    defaultValue={[p.items[0].title]}
                    className="program-accordion"
                  >
                    {p.items.map((item, index) => (
                      <AccordionItem key={item.title} value={item.title}>
                        <AccordionTrigger>
                          <span>
                            <small>0{index + 1}</small>
                            {item.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionPanel>
                          <a
                            className="mission-reference"
                            href={`#misi-${item.mission}`}
                          >
                            Mendukung misi {item.mission}
                            <ArrowUpRight size={14} />
                          </a>
                          <p>{item.description}</p>
                          <p className="program-output">{item.output}</p>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsPanel>
              ))}
            </Tabs>
          </div>
        </section>
        <section id="langkah" className="section-shell section-space">
          <div className="section-label">
            <span>04 / LANGKAH KITA</span>
            <span>USULAN ALUR KERJA</span>
          </div>
          <div className="section-heading">
            <h2>
              Niat baik perlu
              <br />
              langkah yang jelas.
            </h2>
            <p>
              Kita mulai dengan mendengar, menyusun prioritas,
              <br className="desktop-break" /> lalu membuka hasilnya untuk
              dievaluasi bersama.
            </p>
          </div>
          <div className="steps">
            {[
              {
                title: "Dengarkan",
                text: "Petakan kebutuhan dari percakapan terbuka dan masukan anggota.",
                label: "MEMBUKA PERCAKAPAN",
              },
              {
                title: "Kerjakan",
                text: "Tentukan prioritas, penanggung jawab, dan hasil yang ingin dicapai.",
                label: "MENYUSUN PRIORITAS",
              },
              {
                title: "Kabarkan",
                text: "Bagikan perkembangan, terima koreksi, dan perbaiki langkah berikutnya.",
                label: "MERAWAT KEPERCAYAAN",
              },
            ].map((step, i) => (
              <AnimatedContent key={step.title} delay={i * 0.08}>
                <article className="step">
                  <div className="step-number">
                    0{i + 1}
                    <MoveUpRight size={25} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <span className="eyebrow">{step.label}</span>
                </article>
              </AnimatedContent>
            ))}
          </div>
          <p className="timeline-note">
            Jadwal dan target pelaksanaan akan ditentukan setelah pemetaan
            kebutuhan serta kapasitas tim.
          </p>
        </section>
        <section id="aspirasi" className="aspiration-section section-space">
          <div className="section-shell aspiration-grid">
            <div className="aspiration-copy">
              <span className="eyebrow">05 / RUANG ASPIRASI</span>
              <h2>
                Rumah ini
                <br />
                juga punya
                <br />
                <em>suaramu.</em>
              </h2>
              <p>
                Apa satu hal yang ingin kamu lihat
                <br />
                lebih baik di KMTSL?
              </p>
              <div className="aspiration-arrow" aria-hidden="true">
                ↳
              </div>
              <span className="aspiration-footnote">
                IDE KECIL BOLEH.
                <br />
                CERITA PANJANG JUGA BOLEH.
              </span>
            </div>
            <div className="aspiration-form-wrap">
              <span className="form-edition">
                CATATAN UNTUK RUMAH KITA <span>✳</span>
              </span>
              <p className="form-note">
                Mode demo — catatan bisa diunduh, belum dikirim ke tim.
              </p>
              {prepared ? (
                <div className="aspiration-result">
                  <span className="result-check">
                    <Check />
                  </span>
                  <h3>
                    Suaramu sudah
                    <br />
                    jadi catatan.
                  </h3>
                  <p>
                    Unduh dan simpan dulu. Catatan ini{" "}
                    <strong>belum diterima tim kampanye.</strong>
                  </p>
                  <blockquote>{message}</blockquote>
                  <Button className="primary-action" onClick={download}>
                    <Download /> {downloaded ? "Unduh lagi" : "Unduh catatan"}
                  </Button>
                  <p role="status" className="download-status">
                    {downloaded
                      ? "Unduhan dimulai. Simpan file catatan-aspirasi.txt."
                      : ""}
                  </p>
                  <Button variant="link" onClick={() => setPrepared(false)}>
                    Kembali menyunting <ArrowRight />
                  </Button>
                </div>
              ) : (
                <form onSubmit={prepare}>
                  <label className="form-label" htmlFor="aspiration-name">
                    Nama <span>opsional</span>
                  </label>
                  <Input
                    id="aspiration-name"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Boleh tanpa nama"
                    autoComplete="name"
                  />
                  <fieldset className="topic-fieldset">
                    <legend className="form-label">Tentang apa?</legend>
                    <div className="topic-options">
                      {[
                        "Kehidupan kampus",
                        "Akademik",
                        "Pengembangan diri",
                        "Lainnya",
                      ].map((t) => (
                        <label
                          key={t}
                          className={`topic-chip ${topic === t ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="topic"
                            value={t}
                            checked={topic === t}
                            onChange={() => setTopic(t)}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="form-label" htmlFor="aspiration-message">
                    Ceritakan gagasanmu <span>wajib</span>
                  </label>
                  <Textarea
                    id="aspiration-message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      setError("")
                    }}
                    required
                    minLength={10}
                    maxLength={1500}
                    rows={5}
                    aria-invalid={Boolean(error)}
                    aria-describedby="message-help message-error"
                    placeholder="Menurutku, KMTSL akan lebih baik kalau…"
                  />
                  <div id="message-help" className="form-help">
                    <span>Minimal 10 karakter.</span>
                    <span>{message.length}/1.500</span>
                  </div>
                  <p id="message-error" role="alert" className="form-error">
                    {error}
                  </p>
                  <Button type="submit" className="primary-action form-submit">
                    Jadikan catatan <ArrowUpRight />
                  </Button>
                  <p className="privacy-note">
                    Catatan hanya ada di halaman ini dan hilang saat dimuat
                    ulang. Hindari menuliskan data pribadi yang sensitif.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
        <section className="section-shell faq-section section-space">
          <div>
            <span className="eyebrow">SEBELUM KAMU LANJUT</span>
            <h2>
              Mungkin kamu
              <br />
              juga bertanya.
            </h2>
          </div>
          <Accordion className="faq-accordion">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={i}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionPanel>{faq.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
        <CampaignContact />
        <section className="closing section-shell">
          <div className="closing-top">
            <span>RAFIF + DEWA</span>
            <span>UNTUK KMTSL YANG KITA RAWAT BERSAMA.</span>
          </div>
          <a href="#aspirasi" className="closing-link">
            Mulai dari kita.
            <ArrowUpRight />
          </a>
          <div className="closing-bottom">
            <Mark />
            <p>
              Karena rumah yang baik
              <br />
              dibangun oleh semua yang ada di dalamnya.
            </p>
            <a href="#utama">Kembali ke atas ↑</a>
          </div>
        </section>
      </main>
      <footer className="site-footer section-shell">
        <span>Konsep kampanye Rafif & Dewa · KMTSL UGM</span>
        <span>PROTOTIPE / BUKAN LAMAN RESMI UNIVERSITAS</span>
      </footer>
      <Dialog
        open={profile !== null}
        onOpenChange={(open) => {
          if (!open) setProfile(null)
        }}
      >
        <DialogPopup
          closeProps={{ "aria-label": "Tutup profil" }}
          className="profile-dialog"
        >
          <DialogHeader>
            <span className="eyebrow">KENALAN LEBIH DEKAT</span>
            <DialogTitle>
              {profile !== null ? candidates[profile].name : "Profil pasangan"}
            </DialogTitle>
            <DialogDescription>
              {profile !== null ? candidates[profile].role : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            {profile !== null && (
              <>
                <p className="profile-focus">{candidates[profile].focus}</p>
                <p>{candidates[profile].description}</p>
                <div className="profile-placeholder">
                  Profil personal, pengalaman organisasi, dan foto akan
                  ditambahkan setelah dikonfirmasi. Uraian ini adalah konsep
                  peran, bukan klaim rekam jejak.
                </div>
                <Button
                  render={
                    <a
                      href={candidates[profile].linkedin}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  className="primary-action"
                >
                  Lihat profil LinkedIn <ArrowUpRight />
                </Button>
              </>
            )}
          </DialogPanel>
        </DialogPopup>
      </Dialog>
    </>
  )
}

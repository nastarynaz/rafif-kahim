"use client"

import { ArrowUpRight, BookOpen, Camera, MessageSquare } from "lucide-react"
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs"
import { candidates } from "@/lib/campaign-content"

// Empty until the team supplies verified records, licensed photos, and approved
// quotations. These states deliberately make no claims about either candidate.
const stories = [
  {
    id: "pengalaman",
    label: "Pengalaman",
    icon: BookOpen,
    title: "Setiap peran punya cerita.",
    description:
      "Riwayat organisasi dan kepanitiaan Rafif–Dewa akan dilengkapi dengan peran, periode, serta kontribusi yang pernah dijalankan.",
    note: "Riwayat kontribusi sedang disiapkan.",
  },
  {
    id: "galeri",
    label: "Galeri",
    icon: Camera,
    title: "Momen yang ingin kami bagikan.",
    description:
      "Dokumentasi kegiatan dan kebersamaan akan hadir di sini, disertai cerita singkat tentang momen di balik setiap foto.",
    note: "Foto kegiatan belum ditambahkan.",
  },
  {
    id: "testimoni",
    label: "Kata mereka",
    icon: MessageSquare,
    title: "Kenali kami lewat cerita rekan.",
    description:
      "Pengalaman dari orang-orang yang pernah bekerja bersama akan ditampilkan setelah cerita dan izin publikasinya tersedia.",
    note: "Belum ada testimoni yang dipublikasikan.",
  },
]

export function CampaignStories() {
  return (
    <div className="stories-block" id="cerita">
      <div className="stories-heading">
        <span className="eyebrow">DI BALIK PERKENALAN</span>
        <h3>
          Kenal lebih dekat,
          <br />
          lewat cerita.
        </h3>
        <p>
          Pengalaman, dokumentasi, dan sudut pandang rekan yang melengkapi
          perkenalan kami.
        </p>
      </div>
      <Tabs defaultValue="pengalaman" className="stories-tabs">
        <TabsList
          variant="underline"
          aria-label="Cerita pasangan"
          className="stories-tab-list"
        >
          {stories.map((story) => (
            <TabsTab value={story.id} key={story.id}>
              {story.label}
            </TabsTab>
          ))}
        </TabsList>
        {stories.map((story) => (
          <TabsPanel key={story.id} value={story.id} className="story-panel">
            <story.icon size={23} strokeWidth={1.5} aria-hidden="true" />
            <h4>{story.title}</h4>
            <p>{story.description}</p>
            <span className="story-status">
              <span />
              {story.note}
            </span>
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  )
}

export function CampaignContact() {
  return (
    <section
      id="kontak"
      className="contact-section section-shell section-space"
      aria-labelledby="contact-title"
    >
      <div>
        <span className="eyebrow">TETAP TERHUBUNG</span>
        <h2 id="contact-title">
          Percakapan baik
          <br />
          dimulai dari <em>sapa.</em>
        </h2>
        <p>
          Temukan profil kami melalui tautan berikut. Kanal khusus tim kampanye
          akan ditambahkan setelah dikonfirmasi.
        </p>
      </div>
      <div className="contact-links">
        {candidates.map((candidate) => (
          <a
            key={candidate.short}
            href={candidate.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <div>
              <span className="eyebrow">
                LINKEDIN / {candidate.short.toUpperCase()}
              </span>
              <span className="contact-name">{candidate.name}</span>
            </div>
            <ArrowUpRight size={24} />
          </a>
        ))}
        <p>Email dan Instagram kampanye belum diumumkan.</p>
      </div>
    </section>
  )
}

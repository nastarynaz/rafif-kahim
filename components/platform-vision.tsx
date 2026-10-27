import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { officialMissions, officialVision } from "@/lib/platform-content"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/accordion"
import { CampaignPhotoGallery } from "./campaign-reference-photo"

const missionGuides = [
  {
    label: "Komunikasi",
    hint: "Aspirasi yang didengar dan ditindaklanjuti.",
  },
  {
    label: "Tata kelola",
    hint: "Tanggung jawab jelas, proses terbuka.",
  },
  {
    label: "Sinergi",
    hint: "Antarbidang terhubung, kegiatan selaras.",
  },
  {
    label: "Lintas angkatan",
    hint: "Lebih dekat, tanpa sekat angkatan.",
  },
  {
    label: "Jejaring",
    hint: "Kesempatan baru lewat kolaborasi.",
  },
]

export function VisionPage() {
  return (
    <div className="p-container p-direction-section">
      <div className="p-direction-heading">
        <div data-aos="fade-up">
          <span className="p-section-index">02 / VISI & MISI</span>
          <h2>
            Satu visi.
            <br />
            <em>Lima langkah.</em>
          </h2>
          <p>
            KMTSL yang menerima, mendukung, dan membuka kesempatan bagi
            warganya.
          </p>
        </div>
        <div
          className="p-vision-statement"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <span>VISI KAMI</span>
          <blockquote>{officialVision}</blockquote>
          <div className="p-vision-principles" aria-label="Nilai dalam visi">
            <span>Inklusif</span>
            <span>Suportif</span>
            <span>Berintegritas</span>
          </div>
        </div>
      </div>
      <div className="p-missions-heading">
        <h3>Dari visi, ke langkah nyata.</h3>
        <p>Buka misi untuk melihat rencana dan indikatornya.</p>
      </div>
      <div className="p-missions-layout">
        <Accordion type="single" collapsible className="p-mission-list">
          {officialMissions.map((mission, index) => {
            const guide = missionGuides[index]
            return (
              <AccordionItem
                className="p-mission"
                key={mission.title}
                value={`mission-${index}`}
              >
                <AccordionTrigger className="p-mission-trigger">
                  <span className="p-mission-number">0{index + 1}</span>
                  <span className="p-mission-summary">
                    <span className="p-mission-category">{guide.label}</span>
                    <span className="p-mission-title">{mission.title}</span>
                    <span className="p-mission-hint">{guide.hint}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="p-mission-detail">
                  <p className="p-mission-official">{mission.text}</p>
                  <p>{mission.description}</p>
                  <div className="p-mission-detail-grid">
                    <div>
                      <h4>Contoh rencana</h4>
                      <p>{mission.example}</p>
                    </div>
                    <div>
                      <h4>Cara mengevaluasi</h4>
                      <p>{mission.indicator}</p>
                    </div>
                  </div>
                  <Link href={mission.href} className="p-text-link">
                    {mission.link}
                    <ArrowUpRight size={17} />
                  </Link>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
      <CampaignPhotoGallery variant="story" />
      <p className="p-plan-note">
        Rencana disesuaikan dengan kebutuhan warga, kewenangan, dan sumber daya
        KMTSL.
      </p>
      <Link className="p-text-link p-section-next" href="/#partisipasi">
        Sekarang, giliran suaramu <ArrowUpRight size={17} />
      </Link>
    </div>
  )
}

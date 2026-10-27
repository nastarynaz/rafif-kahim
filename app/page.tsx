import { PlatformTestimonials } from "@/components/platform-testimonials"
import { PlatformMotion } from "@/components/platform-motion"
import { PlatformDisclosure } from "@/components/platform-disclosure"
import { PlatformHome } from "@/components/platform-home"
import { VisionPage } from "@/components/platform-vision"
import { ResultsPage } from "@/components/platform-results"
import { AgendaPage } from "@/components/platform-agenda"
import { ParticipationGuide } from "@/components/platform-participation"
import { ParticipationTabs } from "@/components/platform-participation-tabs"

export default function Page() {
  return (
    <PlatformMotion>
      <PlatformHome />
      <section
        id="gagasan"
        aria-label="Gagasan Kami"
        className="p-landing-section p-landing-detail"
        data-nav-section="gagasan"
        tabIndex={-1}
      >
        <VisionPage />
      </section>
      <PlatformTestimonials />
      <section
        id="partisipasi"
        aria-label="Ikut Bersuara"
        className="p-landing-section p-landing-detail"
        data-nav-section="partisipasi"
        tabIndex={-1}
      >
        <ParticipationGuide />
        <PlatformDisclosure
          title="Buka ruang bersuara"
          description="Survei warga atau pesan pribadi. Kamu yang pilih."
        >
          <ParticipationTabs />
        </PlatformDisclosure>
      </section>
      <section
        id="hasil"
        aria-label="Hasil Survei"
        className="p-landing-section p-landing-detail"
        data-nav-section="hasil"
        tabIndex={-1}
      >
        <PlatformDisclosure
          anchor="hasil"
          title="Apa kata warga?"
          description="Buka ringkasan hasil survei yang masuk."
        >
          <ResultsPage />
        </PlatformDisclosure>
      </section>
      <section
        id="agenda"
        aria-label="Agenda"
        className="p-landing-section p-landing-detail"
        data-nav-section="agenda"
        tabIndex={-1}
      >
        <PlatformDisclosure
          anchor="agenda"
          title="Sampai bertemu."
          description="Lihat agenda dan ruang pertemuan berikutnya."
        >
          <AgendaPage />
        </PlatformDisclosure>
      </section>
    </PlatformMotion>
  )
}

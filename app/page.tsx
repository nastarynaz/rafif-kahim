import type { Metadata } from "next"
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site"
import { PlatformMotion } from "@/components/platform-motion"
import { PlatformDisclosure } from "@/components/platform-disclosure"
import { PlatformHome } from "@/components/platform-home"
import { VisionPage } from "@/components/platform-vision"
import { ResultsPage } from "@/components/platform-results"
import { AgendaPage } from "@/components/platform-agenda"
import { ParticipationGuide } from "@/components/platform-participation"
import { ParticipationTabs } from "@/components/platform-participation-tabs"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: siteName,
      alternateName: "Rafif Dewa",
      inLanguage: "id-ID",
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: siteName,
      description: siteDescription,
      inLanguage: "id-ID",
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: [{ "@id": `${siteUrl}/#rafif` }, { "@id": `${siteUrl}/#dewa` }],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#rafif`,
      name: "Muhammad Rafif Thalib",
      description: "Calon Ketua KMTSL FT UGM 2026/2027",
      image: `${siteUrl}/media/rapip-1.webp`,
      sameAs: [
        "https://www.linkedin.com/in/muhammad-rafif-thalib-956b81351/",
        "https://www.instagram.com/rafifth/",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#dewa`,
      name: "Dewa Ngakan Nyoman T. S.",
      description: "Calon Sekretaris Jenderal KMTSL FT UGM 2026/2027",
      image: `${siteUrl}/media/dewa-1.webp`,
      sameAs: [
        "https://www.linkedin.com/in/dewatantra/",
        "https://www.instagram.com/dewa.tantraa/",
      ],
    },
  ],
}

export default function Page() {
  return (
    <PlatformMotion>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
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
        <AgendaPage />
      </section>
    </PlatformMotion>
  )
}

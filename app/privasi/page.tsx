import type { Metadata } from "next"
import { PrivacyPage } from "@/components/platform-privacy"
import { siteName } from "@/lib/site"
export const metadata: Metadata = {
  title: "Privasi dan Perlindungan Data",
  description:
    "Pelajari penggunaan data survei dan aspirasi Rafif–Dewa, pihak yang dapat mengaksesnya, masa penyimpanan, serta cara meminta penghapusan pesan.",
  alternates: { canonical: "/privasi" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName,
    title: "Privasi dan Perlindungan Data | Rafif–Dewa",
    description:
      "Penggunaan, akses, penyimpanan, dan penghapusan data survei serta aspirasi.",
    url: "/privasi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privasi dan Perlindungan Data | Rafif–Dewa",
    description:
      "Penggunaan, akses, penyimpanan, dan penghapusan data survei serta aspirasi.",
  },
}
export default function Page() {
  return <PrivacyPage />
}

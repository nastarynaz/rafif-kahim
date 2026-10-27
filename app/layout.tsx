import type { Metadata } from "next"
import "@fontsource-variable/manrope"
import "@fontsource/anton/latin-400.css"
import "@fontsource-variable/newsreader/wght.css"
import "@fontsource-variable/newsreader/wght-italic.css"
import "aos/dist/aos.css"
import "./globals.css"
import "./platform.css"
import "./platform-motion.css"
import "./campaign-poster.css"
import "./testimonials.css"
import "./campaign-photos.css"
import { PlatformShell } from "@/components/platform-shell"

export const metadata: Metadata = {
  title: "Rafif–Dewa — Samanvaya Sahakara | KMTSL FT UGM",
  description:
    "Samanvaya Sahakara, calon Ketua dan Sekjen KMTSL FT UGM 2026/2027. Kenali gagasan, bagikan pengalaman, dan temukan ruang untuk bertumbuh bersama.",
  robots: { index: false, follow: false },
  icons: {
    icon: { url: "/campaign-mark.svg", type: "image/svg+xml" },
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body>
        <PlatformShell>{children}</PlatformShell>
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import "@fontsource-variable/manrope"
import "@fontsource-variable/newsreader/wght-italic.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Rafif & Dewa — Satu rumah. Banyak suara.",
  description:
    "Visi dan misi Rafif dan Dewa untuk KMTSL UGM: rumah bersama yang terbuka, suportif, dan berintegritas. Kenali pasangan dan gagasannya.",
  robots: { index: false, follow: false },
  icons: { icon: "/campaign-mark.svg", apple: "/campaign-mark.svg" },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

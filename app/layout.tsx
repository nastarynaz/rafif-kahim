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
import {
  indexable,
  siteDescription,
  siteName,
  siteTitle,
  siteUrl,
} from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: "%s | Rafif–Dewa" },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: indexable,
    follow: true,
    googleBot: { index: indexable, follow: true, "max-image-preview": "large" },
  },
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

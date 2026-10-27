"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Button } from "@/components/shadcn/button"
import { Alert, AlertDescription } from "@/components/shadcn/alert"

const links = [
  { href: "/#kenali", label: "Kenali Kami" },
  { href: "/#gagasan", label: "Visi & Misi" },
  { href: "/#partisipasi", label: "Ikut Bersuara" },
  { href: "/#hasil", label: "Hasil Survei" },
  { href: "/#agenda", label: "Agenda" },
]
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState("kenali")
  useEffect(() => {
    if (pathname !== "/") return
    let frame = 0
    const update = () => {
      const sections = [
        ...document.querySelectorAll<HTMLElement>("[data-nav-section]"),
      ]
      const current = sections
        .filter((section) => section.getBoundingClientRect().top <= 150)
        .at(-1)
      setActive(current?.dataset.navSection || "kenali")
    }
    const scroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", scroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", scroll)
      cancelAnimationFrame(frame)
    }
  }, [pathname])
  const isActive = (href: string) => pathname === "/" && href === `/#${active}`
  return (
    <div
      className="platform"
      onClickCapture={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const anchor = (event.target as Element).closest<HTMLAnchorElement>(
          "a[href]"
        )
        if (!anchor || anchor.target === "_blank") return
        const url = new URL(anchor.href)
        if (
          pathname !== "/" ||
          url.origin !== location.origin ||
          url.pathname !== "/" ||
          !url.hash
        )
          return
        const target = document.getElementById(
          decodeURIComponent(url.hash.slice(1))
        )
        if (!target) return
        event.preventDefault()
        setOpen(false)
        if (location.hash !== url.hash)
          history.pushState(null, "", url.pathname + url.search + url.hash)
        window.dispatchEvent(new Event("platform:navigate"))
        // Wait for the mobile menu to close before measuring the anchor position.
        requestAnimationFrame(() => {
          target.focus({ preventScroll: true })
          target.scrollIntoView({ behavior: "instant", block: "start" })
        })
      }}
    >
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>
      <div className="p-announcement">
        Selaras dalam langkah, bersama dalam karya.
        <span className="p-announcement-right">KMTSL FT UGM · 2026/2027</span>
      </div>
      <header
        className="p-header"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            setOpen(false)
            menuRef.current?.focus()
          }
        }}
      >
        <div className="p-container p-nav">
          <Link
            className="p-brand"
            href="/#beranda"
            aria-label="Samanvaya Sahakara, beranda"
          >
            <span className="p-campaign-wordmark">
              RAFIF<span>DEWA.</span>
            </span>
          </Link>
          <nav aria-label="Navigasi utama" className="p-desktop-nav">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "location" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Button asChild className="p-button small p-nav-cta">
            <Link href="/#aspirasi">
              Kirim Aspirasi <ArrowUpRight size={15} />
            </Link>
          </Button>
          <Button
            ref={menuRef}
            className="p-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Navigasi seluler"
            className="p-mobile-nav"
          >
            {[...links, { href: "/#aspirasi", label: "Kirim Aspirasi" }].map(
              (l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "location" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                  <ArrowUpRight size={16} />
                </Link>
              )
            )}
          </nav>
        )}
      </header>
      <main id="konten" tabIndex={-1}>
        {children}
      </main>
      <footer className="p-footer">
        <div className="p-container">
          <div className="p-footer-top">
            <div>
              <span className="p-eyebrow">SAMANVAYA SAHAKARA</span>
              <p>
                Satu rumah.
                <br />
                <em>Bertumbuh bersama.</em>
              </p>
            </div>
            <div className="p-footer-links">
              <Link href="/#gagasan">
                Kenali gagasan kami <ArrowUpRight size={16} />
              </Link>
              <Link href="/#aspirasi">
                Ada yang ingin diceritakan? <ArrowUpRight size={16} />
              </Link>
              <Link href="/privasi">
                Privasi & penggunaan data <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <div className="p-footer-bottom">
            <span>
              Rafif–Dewa · Calon Ketua & Sekjen KMTSL FT UGM 2026/2027
            </span>
            <span>
              <a
                href="https://www.linkedin.com/in/khoirunas"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dibuat oleh Nasta Khoirunas
              </a>
              {" · "}
              <Link href="/admin">Admin ↗</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
export function PageIntro({
  eyebrow,
  title,
  italic,
  children,
  headingLevel = 1,
}: {
  eyebrow: string
  title: string
  italic?: string
  children: React.ReactNode
  headingLevel?: 1 | 2
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2"
  return (
    <section className="p-page-intro p-container">
      <span className="p-eyebrow">
        <span className="p-line" />
        {eyebrow}
      </span>
      <Heading>
        {title} {italic && <em>{italic}</em>}
      </Heading>
      <p>{children}</p>
    </section>
  )
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode
  error?: boolean
}) {
  return (
    <Alert
      className={error ? "p-notice error" : "p-notice"}
      role={error ? "alert" : "status"}
    >
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}

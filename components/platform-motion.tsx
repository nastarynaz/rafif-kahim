"use client"

import { useEffect, useRef } from "react"
import type AOS from "aos"

let aosInitialized = false

export function PlatformMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    let disposed = false
    let aos: typeof AOS | undefined
    let frame = 0
    let posterVisible = false
    let paused = false
    let keyboard = document.activeElement?.matches(":focus-visible") ?? false
    const poster = root.querySelector(".p-campaign-poster")
    const toggle = root.querySelector<HTMLButtonElement>(
      ".p-poster-motion-toggle"
    )
    root.dataset.marqueeReady = "true"

    const updateMarquee = () => {
      root.dataset.marqueeRunning = String(
        posterVisible &&
          !paused &&
          !keyboard &&
          !preference.matches &&
          !document.hidden
      )
    }
    const visibility = new IntersectionObserver(([entry]) => {
      posterVisible = entry.isIntersecting
      updateMarquee()
    })
    if (poster) visibility.observe(poster)
    const pause = () => {
      paused = !paused
      if (!paused) keyboard = false
      toggle?.setAttribute("aria-pressed", String(paused))
      const label = paused ? "Lanjutkan teks latar" : "Jeda teks latar"
      toggle?.setAttribute("aria-label", label)
      toggle?.setAttribute("title", label)
      updateMarquee()
    }
    const reveal = (target: ParentNode = root) => {
      target
        .querySelectorAll("[data-aos]")
        .forEach((element) => element.classList.add("aos-animate"))
    }
    const refresh = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => aos?.refresh())
    }
    const navigate = () => {
      const target = document.getElementById(
        decodeURIComponent(location.hash.slice(1))
      )
      if (target) reveal(target)
      refresh()
    }
    const keydown = (event: KeyboardEvent) => {
      if (
        ![
          "Tab",
          "Enter",
          " ",
          "Escape",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ].includes(event.key)
      )
        return
      keyboard = true
      root.dataset.keyboard = "true"
      reveal()
      updateMarquee()
    }
    const pointerdown = () => {
      keyboard = false
      delete root.dataset.keyboard
      updateMarquee()
    }
    const reduce = () => {
      if (preference.matches) reveal()
      updateMarquee()
    }

    // Initialize the library once; later visits only refresh the current elements.
    void Promise.all([import("aos"), document.fonts.ready]).then(([module]) => {
      if (disposed) return
      aos = module.default
      if (!aosInitialized) {
        aos.init({
          duration: 600,
          easing: "ease-out-cubic",
          offset: 48,
          once: true,
          disableMutationObserver: true,
        })
        aosInitialized = true
      } else aos.refreshHard()
      if (preference.matches || keyboard) reveal()
      root.dataset.aosReady = "true"
      navigate()
    })
    const resize = new ResizeObserver(refresh)
    resize.observe(root)
    toggle?.addEventListener("click", pause)
    document.addEventListener("keydown", keydown, true)
    document.addEventListener("pointerdown", pointerdown, true)
    document.addEventListener("visibilitychange", updateMarquee)
    preference.addEventListener("change", reduce)
    window.addEventListener("platform:navigate", navigate)
    window.addEventListener("hashchange", navigate)
    root.addEventListener("toggle", refresh, true)
    root.addEventListener("load", refresh, true)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      visibility.disconnect()
      delete root.dataset.aosReady
      delete root.dataset.marqueeReady
      delete root.dataset.marqueeRunning
      delete root.dataset.keyboard
      toggle?.removeEventListener("click", pause)
      toggle?.setAttribute("aria-pressed", "false")
      toggle?.setAttribute("aria-label", "Jeda teks latar")
      toggle?.setAttribute("title", "Jeda teks latar")
      document.removeEventListener("keydown", keydown, true)
      document.removeEventListener("pointerdown", pointerdown, true)
      document.removeEventListener("visibilitychange", updateMarquee)
      preference.removeEventListener("change", reduce)
      window.removeEventListener("platform:navigate", navigate)
      window.removeEventListener("hashchange", navigate)
      root.removeEventListener("toggle", refresh, true)
      root.removeEventListener("load", refresh, true)
      aos?.refreshHard()
    }
  }, [])

  return (
    <div className="p-motion-root" ref={ref}>
      {children}
    </div>
  )
}

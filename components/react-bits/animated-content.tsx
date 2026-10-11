"use client"

// Adapted from React Bits AnimatedContent by David Haz.
// https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/AnimatedContent/AnimatedContent.tsx
// Local changes: reduced-motion support, visible SSR fallback, scoped GSAP cleanup.
// License: ./LICENSE.md
import { useEffect, useRef, type ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function AnimatedContent({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const el = ref.current
      if (!el) return
      gsap.fromTo(
        el,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 94%", once: true },
          clearProps: "transform,opacity",
        }
      )
    })
    return () => media.revert()
  }, [delay])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

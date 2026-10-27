"use client"

import { useEffect, useRef } from "react"
import { ArrowDownRight } from "lucide-react"

export function PlatformDisclosure({
  anchor,
  title,
  description,
  children,
}: {
  anchor?: string
  title: string
  description: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    let frame = 0
    const reveal = () => {
      const hash = decodeURIComponent(location.hash.slice(1))
      const target = hash ? document.getElementById(hash) : null
      if (
        !target ||
        !ref.current ||
        (hash !== anchor && !ref.current.contains(target))
      )
        return
      ref.current.open = true
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() =>
        target.scrollIntoView({ block: "start", behavior: "instant" })
      )
    }
    reveal()
    window.addEventListener("hashchange", reveal)
    window.addEventListener("platform:navigate", reveal)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("hashchange", reveal)
      window.removeEventListener("platform:navigate", reveal)
    }
  }, [anchor])

  return (
    <details className="p-section-disclosure" ref={ref}>
      <summary className="p-container">
        <span>
          <strong>{title}</strong>
          <span>{description}</span>
        </span>
        <ArrowDownRight size={26} />
      </summary>
      <div className="p-disclosure-content">{children}</div>
    </details>
  )
}

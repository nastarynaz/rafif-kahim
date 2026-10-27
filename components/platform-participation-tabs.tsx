"use client"

import { useEffect, useState } from "react"
import { BarChart3, MessageCircle } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs"
import { SurveyPage } from "./platform-survey"
import { FeedbackPage } from "./platform-feedback"

export function ParticipationTabs() {
  const [channel, setChannel] = useState("survei")

  useEffect(() => {
    let frame = 0
    const sync = () => {
      const hash = window.location.hash.slice(1)
      if (hash !== "survei" && hash !== "aspirasi") return
      setChannel(hash)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const section = document.getElementById(hash)
        section?.focus({ preventScroll: true })
        section?.scrollIntoView({ block: "start", behavior: "instant" })
      })
    }
    sync()
    window.addEventListener("hashchange", sync)
    window.addEventListener("platform:navigate", sync)
    return () => {
      window.removeEventListener("hashchange", sync)
      window.removeEventListener("platform:navigate", sync)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <Tabs
      value={channel}
      className="p-participation-tabs"
      onValueChange={(value) => {
        setChannel(value)
        history.pushState(null, "", `/#${value}`)
      }}
    >
      <div className="p-container p-channel-switch">
        <TabsList aria-label="Pilih cara bersuara" variant="line">
          <TabsTrigger value="survei">
            <BarChart3 size={17} /> Survei warga
          </TabsTrigger>
          <TabsTrigger value="aspirasi">
            <MessageCircle size={17} /> Kirim aspirasi
          </TabsTrigger>
        </TabsList>
        <span>Pilih ruang yang sesuai ceritamu.</span>
      </div>
      <TabsContent forceMount value="survei" className="p-participation-panel">
        <section
          id="survei"
          aria-label="Survei Warga"
          className="p-anchor-target"
          tabIndex={-1}
        >
          <SurveyPage />
        </section>
      </TabsContent>
      <TabsContent
        forceMount
        value="aspirasi"
        className="p-participation-panel"
      >
        <section
          id="aspirasi"
          aria-label="Ruang Aspirasi"
          className="p-anchor-target"
          tabIndex={-1}
        >
          <FeedbackPage />
        </section>
      </TabsContent>
    </Tabs>
  )
}

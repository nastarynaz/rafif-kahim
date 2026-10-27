import type { Agenda } from "./platform-content"

// Temporarily withhold the Desak schedule without changing its stored dates.
export function hasPublishedSchedule(event: Pick<Agenda, "title">) {
  return !/^desak\s+rafif[\s–—-]+dewa$/i.test(event.title.trim())
}

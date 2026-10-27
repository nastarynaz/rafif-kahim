"use client"
import { useCallback, useEffect, useRef, useState } from "react"

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options.headers },
    signal: AbortSignal.timeout(15000),
  })
  const result = await response.json()
  if (!response.ok)
    throw new Error(
      result.error || "Permintaan belum berhasil. Silakan coba kembali."
    )
  return result as T
}
export function useLiveData<T>(url: string | null, interval = 15000) {
  const [state, setState] = useState<{
    source: string | null
    data: T | null
    error: string
    syncedAt: string | null
  }>({ source: null, data: null, error: "", syncedAt: null })
  const sequence = useRef(0)
  const reload = useCallback(async () => {
    if (!url) return
    const requestId = ++sequence.current
    try {
      const next = await api<T>(url)
      if (requestId === sequence.current)
        setState({
          source: url,
          data: next,
          error: "",
          syncedAt: new Date().toISOString(),
        })
    } catch (e) {
      if (requestId === sequence.current)
        setState((previous) => ({
          source: url,
          data: previous.source === url ? previous.data : null,
          syncedAt: previous.source === url ? previous.syncedAt : null,
          error:
            e instanceof Error
              ? e.message
              : "Koneksi terputus. Mencoba kembali.",
        }))
    }
  }, [url])
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!cancelled && !document.hidden) await reload()
    }
    void load()
    const timer = setInterval(load, interval)
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("kmtsl_updates")
        : null
    if (channel) channel.onmessage = load
    window.addEventListener("online", load)
    document.addEventListener("visibilitychange", load)
    return () => {
      cancelled = true
      clearInterval(timer)
      channel?.close()
      window.removeEventListener("online", load)
      document.removeEventListener("visibilitychange", load)
    }
  }, [reload, interval])
  const current = state.source === url
  return {
    data: current ? state.data : null,
    error: current ? state.error : "",
    loading: Boolean(url) && !current,
    syncedAt: current ? state.syncedAt : null,
    reload,
  }
}
export function announceUpdate() {
  if (typeof BroadcastChannel !== "undefined") {
    const c = new BroadcastChannel("kmtsl_updates")
    c.postMessage("saved")
    c.close()
  }
}

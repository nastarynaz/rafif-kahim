import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "Rafif–Dewa — Samanvaya Sahakara, KMTSL FT UGM 2026/2027"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const font = await readFile(
    join(
      process.cwd(),
      "node_modules/@fontsource/anton/files/anton-latin-400-normal.woff"
    )
  )
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "48px 60px",
        color: "#edf4ff",
        background: "linear-gradient(120deg, #0b1f3a, #193d74)",
        fontFamily: "Anton",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <span>SAMANVAYA SAHAKARA</span>
        <span>KMTSL FT UGM · 2026/2027</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontSize: 150, lineHeight: 1.1 }}>
          RAFIF–DEWA.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 57,
            color: "#aac1e4",
            marginTop: 16,
          }}
        >
          RUMAH UNTUK TUMBUH BERSAMA.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #7e9ac6",
          paddingTop: 22,
          fontSize: 23,
        }}
      >
        <span>CALON KETUA & SEKRETARIS JENDERAL</span>
        <span>rafifdewa.space</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Anton", data: font, weight: 400, style: "normal" }],
    }
  )
}

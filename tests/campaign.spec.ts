import { expect, test } from "@playwright/test"
import { missions, vision } from "../lib/campaign-content"

test("visi dan lima misi terbaca utuh pada desktop dan ponsel", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(page.locator(".vision-statement blockquote")).toHaveText(vision)
  for (const mission of missions) {
    await expect(page.locator(`#misi-${mission.number} p`)).toHaveText(
      mission.text
    )
  }
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 })
    await page.evaluate(() => document.fonts.ready)
    const metrics = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      missionText: parseFloat(
        getComputedStyle(document.querySelector(".mission-row p")!).fontSize
      ),
    }))
    if (metrics.content > metrics.width) {
      console.log(
        await page.evaluate(() =>
          Array.from(document.querySelectorAll("body *"))
            .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
            .map((el) => ({
              tag: el.tagName,
              className: el.className,
              right: el.getBoundingClientRect().right,
              text: el.textContent?.slice(0, 50),
            }))
            .slice(0, 25)
        )
      )
      await page.screenshot({
        path: `test-results/overflow-${width}.png`,
        fullPage: true,
      })
    }
    expect(
      metrics.content,
      `horizontal overflow at ${width}px`
    ).toBeLessThanOrEqual(metrics.width)
    expect(metrics.missionText).toBeGreaterThanOrEqual(16)
  }
  await page.screenshot({ path: "test-results/campaign-desktop-hero.png" })
  await page.screenshot({
    path: "test-results/campaign-desktop.png",
    fullPage: true,
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({
    path: "test-results/campaign-mobile.png",
    fullPage: true,
  })
  await page.locator(".candidate-grid").scrollIntoViewIfNeeded()
  await page.screenshot({ path: "test-results/campaign-mobile-profiles.png" })
  expect(errors).toEqual([])
})

test("navigasi, program, cerita, dan dialog dapat digunakan", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByRole("button", { name: "Buka menu" }).click()
  await page
    .getByRole("navigation", { name: "Navigasi seluler" })
    .getByRole("link", { name: "Visi & misi" })
    .click()
  await expect(page).toHaveURL(/#arah$/)
  await expect(
    page.getByRole("navigation", { name: "Navigasi seluler" })
  ).toHaveCount(0)
  await page.getByRole("tab", { name: "Bertumbuh" }).click()
  await expect(
    page.getByRole("heading", { name: "Belajar terasa lebih dekat." })
  ).toBeVisible()
  await page.getByRole("button", { name: "02 Jendela Profesi" }).click()
  await expect(
    page.getByRole("link", { name: "Mendukung misi 05" })
  ).toBeVisible()
  await page.getByRole("tab", { name: "Galeri", exact: true }).click()
  await expect(page.getByText("Foto kegiatan belum ditambahkan.")).toBeVisible()
  await page.getByRole("tab", { name: "Kata mereka" }).click()
  await expect(
    page.getByText("Belum ada testimoni yang dipublikasikan.")
  ).toBeVisible()
  await page.getByRole("button", { name: "Kenali Dewa" }).click()
  await expect(page.getByRole("dialog")).toContainText(
    "Dewa Ngakan Nyoman Tantra Swastika"
  )
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Kenali Dewa" })).toBeFocused()
})

test("aspirasi memvalidasi isi dan mengunduh catatan tanpa mengirim ke tim", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByLabel("Ceritakan gagasanmu").fill("          ")
  await page.getByRole("button", { name: "Jadikan catatan" }).click()
  await expect(page.locator("#message-error")).toContainText(
    "sedikitnya 10 karakter"
  )
  await page
    .getByLabel("Ceritakan gagasanmu")
    .fill("Semoga ada ruang belajar bersama lintas angkatan.")
  await page.getByRole("button", { name: "Jadikan catatan" }).click()
  await expect(
    page.getByText("belum diterima tim kampanye.", { exact: true })
  ).toBeVisible()
  const downloadEvent = page.waitForEvent("download")
  await page.getByRole("button", { name: "Unduh catatan", exact: true }).click()
  expect((await downloadEvent).suggestedFilename()).toBe("catatan-aspirasi.txt")
  await page.getByRole("button", { name: "Kembali menyunting" }).click()
  await expect(page.getByLabel("Ceritakan gagasanmu")).toHaveValue(
    "Semoga ada ruang belajar bersama lintas angkatan."
  )
})

import { expect, test } from "@playwright/test"

test("dashboard preserves its last snapshot on network failure and recovers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const initial = await (
    await page.request.get("/api/public?resource=results")
  ).json()
  await page.goto("/hasil")
  await expect(page.locator(".p-stat-card").first()).toContainText(
    String(initial.total)
  )
  await page.route(/\/api\/public\?resource=results/, (route) =>
    route.abort("failed")
  )
  await page.getByRole("button", { name: "Segarkan data" }).click()
  await expect(page.locator(".p-notice.error")).toContainText(
    "Koneksi terputus"
  )
  await expect(page.locator(".p-stat-card").first()).toContainText(
    String(initial.total)
  )
  await page.unroute(/\/api\/public\?resource=results/)
  await page.getByRole("button", { name: "Segarkan data" }).click()
  await expect(page.locator(".p-notice.error")).toHaveCount(0)
  await page.screenshot({
    path: "test-results/results-mobile.png",
    fullPage: true,
  })
})

test("failed feedback submission keeps text and keyboard labels accessible", async ({
  page,
}) => {
  await page.goto("/aspirasi")
  await page.getByLabel("Tentang apa ceritamu?").selectOption("Aspirasi")
  const message = page.getByLabel("Apa yang ingin kamu ceritakan?")
  await message.fill("Cerita ini harus tetap ada ketika koneksi gagal.")
  await page.locator("#aspirasi").getByRole("checkbox").check()
  await page.route("**/api/feedback", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Gangguan koneksi uji. Coba kembali." }),
    })
  )
  await page.getByRole("button", { name: "Kirim Cerita" }).click()
  await expect(page.locator(".p-notice.error")).toContainText(
    "Gangguan koneksi uji"
  )
  await expect(message).toHaveValue(
    "Cerita ini harus tetap ada ketika koneksi gagal."
  )
  await message.focus()
  await expect(message).toBeFocused()
})

test("public pages fit 360 and 768px without horizontal clipping", async ({
  page,
}) => {
  for (const width of [360, 768]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of [
      "/",
      "/visi-misi",
      "/survei",
      "/hasil",
      "/aspirasi",
      "/agenda",
      "/privasi",
    ]) {
      await page.goto(route)
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        ),
        `${route} at ${width}`
      ).toBe(true)
    }
  }
})

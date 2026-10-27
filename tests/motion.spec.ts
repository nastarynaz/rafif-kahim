import { expect, test } from "@playwright/test"

test.describe("campaign motion", () => {
  test.use({ reducedMotion: "no-preference" })

  test("motion settles, respects live preferences, and keeps drafts usable", async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto("/")
    await expect(page.locator(".p-motion-root")).toHaveAttribute(
      "data-aos-ready",
      "true"
    )
    await expect(page.locator(".p-poster-title")).toHaveCSS("transform", "none")
    await expect(page.locator(".p-poster-person").first()).toHaveCSS(
      "transform",
      "none"
    )
    const track = page.locator(".p-poster-track").first()
    const moving = await track.evaluate(
      (element) => getComputedStyle(element).transform
    )
    await expect
      .poll(() =>
        track.evaluate((element) => getComputedStyle(element).transform)
      )
      .not.toBe(moving)
    await page.getByRole("button", { name: "Jeda teks latar" }).click()
    await expect(
      page.getByRole("button", { name: "Lanjutkan teks latar" })
    ).toHaveAttribute("aria-pressed", "true")
    expect(
      await track.evaluate(async (element) => {
        await Promise.all(
          element.getAnimations().map((animation) => animation.ready)
        )
        const paused = getComputedStyle(element).transform
        for (let frame = 0; frame < 10; frame++)
          await new Promise(requestAnimationFrame)
        return getComputedStyle(element).transform === paused
      })
    ).toBe(true)
    await page.getByRole("button", { name: "Lanjutkan teks latar" }).click()
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth
        )
      ).toBe(true)
    }
    await page.locator(".p-nav-cta").click()
    const message = page.getByLabel("Apa yang ingin kamu ceritakan?")
    await message.fill("Draft tetap terbaca ketika preferensi animasi berubah.")
    await page.emulateMedia({ reducedMotion: "reduce" })
    await expect(track).toHaveCSS("animation-name", "none")
    await expect(
      page.locator(".p-direction-heading [data-aos]").first()
    ).toHaveCSS("opacity", "1")
    await expect(message).toHaveValue(
      "Draft tetap terbaca ketika preferensi animasi berubah."
    )
    await page.emulateMedia({ reducedMotion: "no-preference" })
    await expect(page.locator(".p-motion-root")).toHaveAttribute(
      "data-aos-ready",
      "true"
    )
    const feedbackTab = page.getByRole("tab", { name: "Kirim aspirasi" })
    await feedbackTab.focus()
    await feedbackTab.press("ArrowLeft")
    await expect(
      page.getByRole("button", { name: "Mulai Berbagi" })
    ).toBeVisible()
    await page.getByRole("tab", { name: "Survei warga" }).press("ArrowRight")
    await expect(message).toBeVisible()
    await expect(message).toHaveValue(
      "Draft tetap terbaca ketika preferensi animasi berubah."
    )
    expect(errors).toEqual([])
  })
})

test.describe("static fallback", () => {
  test.use({ javaScriptEnabled: false })

  test("the campaign and native profiles remain readable without JavaScript", async ({
    page,
  }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "TUMBUH"
    )
    await expect(page.locator(".p-poster-word").last()).toBeVisible()
    await page.locator(".p-candidate-details summary").first().click()
    await expect(page.locator(".p-candidate-bio").first()).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  })
})

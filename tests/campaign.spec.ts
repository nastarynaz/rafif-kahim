import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test"
import {
  officialMissions,
  officialVision,
  questionIds,
} from "../lib/platform-content"
const headers = {
  "Content-Type": "application/json",
  Origin: "http://127.0.0.1:3001",
}
async function loginApi(request: APIRequestContext, role = "owner") {
  const r = await request.post("/api/auth", {
    headers,
    data: { email: `${role}@local.test`, password: "test-only-password" },
  })
  expect(r.status()).toBe(200)
}
async function loginUi(page: Page) {
  await page.goto("/admin")
  await page.getByLabel("Email", { exact: true }).fill("owner@local.test")
  await page
    .getByLabel("Kata sandi", { exact: true })
    .fill("test-only-password")
  await page.getByRole("button", { name: "Masuk", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Ringkasan survei." })
  ).toBeVisible()
}

test("landing anchors keep survey and feedback drafts in one document", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page.locator("h1")).toHaveCount(1)
  for (const id of [
    "kenali",
    "gagasan",
    "partisipasi",
    "survei",
    "hasil",
    "agenda",
    "aspirasi",
  ])
    await expect(page.locator(`#${id}`)).toHaveCount(1)

  await expect(page.locator(".p-section-disclosure[open]")).toHaveCount(0)
  await page.locator('.p-participation-option[href="/#survei"]').click()
  const survey = page.locator("#survei")
  await survey.getByRole("checkbox").check()
  await survey.getByRole("button", { name: "Mulai Berbagi" }).click()
  await survey.locator(".p-rating-options label").first().click()
  await page.locator(".p-nav-cta").click()
  await expect(page).toHaveURL(/\/#aspirasi$/)
  await expect(page.locator("#aspirasi")).toBeVisible()
  await expect(survey).toBeHidden()
  const message = page
    .locator("#aspirasi")
    .getByLabel("Apa yang ingin kamu ceritakan?")
  await message.fill("Draft ini tetap ada saat berpindah bagian.")
  await page
    .getByRole("navigation", { name: "Navigasi utama" })
    .getByRole("link", { name: "Ikut Bersuara" })
    .click()
  await page.locator('.p-participation-option[href="/#survei"]').click()
  await expect(page).toHaveURL(/\/#survei$/)
  await expect(survey.locator(".p-rating-options input").first()).toBeChecked()
  await expect(message).toHaveValue(
    "Draft ini tetap ada saat berpindah bagian."
  )
  await expect(survey.locator(".p-form-progress")).toContainText(
    "BAGIAN 1 DARI 5"
  )
  await expect(page.locator(".p-header")).toHaveCSS("position", "sticky")
  const surveyTab = page.getByRole("tab", { name: "Survei warga" })
  await surveyTab.focus()
  await surveyTab.press("ArrowRight")
  await expect(
    page.getByRole("tab", { name: "Kirim aspirasi" })
  ).toHaveAttribute("aria-selected", "true")
  await expect(message).toBeVisible()
  await expect(message).toHaveValue(
    "Draft ini tetap ada saat berpindah bagian."
  )
  await page.getByRole("tab", { name: "Kirim aspirasi" }).press("ArrowLeft")
  await expect(survey.locator(".p-rating-options input").first()).toBeChecked()
  const panel = page.locator(".p-section-disclosure").first()
  await panel.locator("summary").click()
  await expect(survey).toBeHidden()
  await panel.locator("summary").click()
  await expect(survey.locator(".p-rating-options input").first()).toBeChecked()
  for (const tab of await page.getByRole("tab").all()) {
    const panelId = await tab.getAttribute("aria-controls")
    await expect(page.locator(`[id="${panelId}"]`)).toHaveCount(1)
  }
})

test("official content, photos, mobile navigation and public routes", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Rumah untuk"
  )
  await expect(page.locator(".p-person-rafif img")).toBeVisible()
  await expect(page.locator(".p-person-dewa img")).toBeVisible()
  await expect(
    page
      .getByRole("navigation", { name: "Navigasi utama" })
      .getByRole("link", { name: "Beranda", exact: true })
  ).toHaveCount(0)
  await expect(page.locator(".p-reference-photo")).toHaveCount(5)
  await expect(page.locator(".p-reference-photo figcaption")).toHaveCount(0)
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  })
  await page.goto("/visi-misi")
  await expect(page.locator(".p-vision-statement blockquote")).toHaveText(
    officialVision
  )
  for (const [index, m] of officialMissions.entries()) {
    await page.locator(".p-mission").nth(index).getByRole("button").click()
    await expect(page.getByText(m.text, { exact: true })).toBeVisible()
  }
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      ),
      `overflow ${width}`
    ).toBe(true)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  })
  await page.getByRole("button", { name: "Buka menu" }).click()
  await page
    .getByRole("navigation", { name: "Navigasi seluler" })
    .getByRole("link", { name: "Ikut Bersuara" })
    .click()
  await expect(page).toHaveURL(/#partisipasi$/)
  await expect(page.getByRole("button", { name: "Buka menu" })).toHaveAttribute(
    "aria-expanded",
    "false"
  )
  await page.locator('.p-participation-option[href="/#survei"]').click()
  await expect(page).toHaveURL(/#survei$/)
  for (const path of [
    "/survei",
    "/hasil",
    "/aspirasi",
    "/agenda",
    "/privasi",
    "/admin",
  ]) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      ),
      `${path} overflows`
    ).toBe(true)
  }
  expect(errors).toEqual([])
})
test("authorization, CSRF, validation and public endpoints fail closed", async ({
  request,
}) => {
  for (const path of [
    "/api/admin/feedback",
    "/api/admin/agenda",
    "/api/admin/admins",
    "/api/auth",
  ])
    expect((await request.get(path)).status()).toBe(401)
  expect(
    (await request.post("/api/admin/agenda", { headers, data: {} })).status()
  ).toBe(401)
  expect((await request.get("/api/feedback")).status()).toBe(405)
  expect((await request.get("/api/public?resource=feedback")).status()).toBe(
    404
  )
  expect(
    (
      await request.post("/api/feedback", {
        headers: { ...headers, Origin: "https://untrusted.example" },
        data: {},
      })
    ).status()
  ).toBe(403)
  expect(
    (
      await request.post("/api/feedback", {
        headers,
        data: { message: "", category: "Keluhan", consent: true },
      })
    ).status()
  ).toBe(400)
  expect(
    (
      await request.post("/api/survey", {
        headers,
        data: { consent: true, ratings: {} },
      })
    ).status()
  ).toBe(400)
  expect(
    (
      await request.post("/api/feedback", {
        headers,
        data: {
          category: "Aspirasi",
          consent: true,
          message: "x".repeat(25000),
        },
      })
    ).status()
  ).toBe(413)
})
test("survey persists, excludes N/A, suppresses groups and updates dashboard", async ({
  page,
  playwright,
}) => {
  const owner = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:3001",
  })
  await loginApi(owner)
  expect(
    (
      await owner.post("/api/admin/periods", {
        headers,
        data: {
          title: "Periode integrasi lokal",
          starts_at: new Date(Date.now() - 3600000).toISOString(),
          ends_at: new Date(Date.now() + 86400000).toISOString(),
          is_open: false,
        },
      })
    ).status()
  ).toBe(201)
  const period = (await (await owner.get("/api/admin/periods")).json())[0]
  expect(
    (
      await owner.patch(`/api/admin/periods/${period.id}`, {
        headers,
        data: { is_open: true },
      })
    ).status()
  ).toBe(200)
  await page.goto("/survei")
  await page.getByRole("button", { name: "Mulai Berbagi" }).click()
  await expect(page.locator(".p-notice[role=alert]")).toContainText(
    "persetujuan"
  )
  await page.locator("#survei").getByRole("checkbox").check()
  await page.getByRole("button", { name: "Mulai Berbagi" }).click()
  await page.getByRole("button", { name: "Lanjutkan" }).click()
  await expect(page.locator(".p-notice[role=alert]")).toContainText(
    "Pilih jawaban"
  )
  for (let step = 0; step < 5; step++) {
    for (const field of await page.locator("fieldset").all())
      await field.locator(".p-rating-options label").nth(3).click()
    if (step === 0) await page.locator('input[name="relasi_2"]').last().check()
    await page.getByRole("button", { name: "Lanjutkan" }).click()
  }
  await page.getByRole("button", { name: "Kirim Jawaban" }).click()
  await expect(
    page.getByText("JAWABAN BERHASIL DISIMPAN", { exact: true })
  ).toBeVisible()
  await page.goto("/hasil")
  await expect(page.locator(".p-stat-card").first()).toContainText("1")
  let aggregate = await (
    await page.request.get("/api/public?resource=results")
  ).json()
  expect(
    aggregate.aspects.every((a: { suppressed: boolean }) => a.suppressed)
  ).toBe(true)
  const ratings = Object.fromEntries(
    questionIds.map((id) => [id, id === "relasi_2" ? null : 4])
  )
  for (let i = 0; i < 4; i++) {
    const visitor = await playwright.request.newContext({
      baseURL: "http://127.0.0.1:3001",
    })
    expect(
      (
        await visitor.post("/api/survey", {
          headers,
          data: {
            period_id: period.id,
            consent: true,
            ratings,
            optional_comments: "Privat: jangan tampilkan ini",
          },
        })
      ).status()
    ).toBe(201)
    if (i === 0)
      expect(
        (
          await visitor.post("/api/survey", {
            headers,
            data: { period_id: period.id, consent: true, ratings },
          })
        ).status()
      ).toBe(409)
    await visitor.dispose()
  }
  await expect(page.locator(".p-stat-card").first()).toContainText("5", {
    timeout: 22000,
  })
  aggregate = await (
    await page.request.get("/api/public?resource=results")
  ).json()
  const rel = aggregate.aspects.find(
    (a: { aspect: string }) => a.aspect === "relasi"
  )
  expect(rel.average).toBe(4)
  expect(rel.valid_answers).toBe(5)
  expect(rel.na_answers).toBe(5)
  await expect(page.locator(".p-insight-grid")).toHaveCount(0)
  await expect(
    page.getByText("Aspek yang dapat ditampilkan memiliki skor setara.", {
      exact: false,
    })
  ).toBeVisible()
  expect(JSON.stringify(aggregate)).not.toContain("Privat:")
  await page.reload()
  await expect(page.locator(".p-stat-card").first()).toContainText("5")
  await page.screenshot({ path: "test-results/results.png", fullPage: true })
  await owner.dispose()
})
test("private feedback, role separation, status, escaping and deletion receipt", async ({
  page,
  playwright,
}) => {
  await page.goto("/aspirasi")
  await page.getByLabel("Tentang apa ceritamu?").selectOption("Keluhan")
  await page.getByLabel("Subjek").fill("Pesan privat uji")
  await page
    .getByLabel("Apa yang ingin kamu ceritakan?")
    .fill(
      '<script>alert("xss")</script> Catatan pribadi tidak boleh masuk dashboard.'
    )
  await page.locator("#aspirasi").getByRole("checkbox").check()
  await page.getByRole("button", { name: "Kirim Cerita" }).click()
  await expect(
    page.getByText("PESAN BERHASIL DISIMPAN", { exact: true })
  ).toBeVisible()
  const codes = await page.locator(".p-receipt code").allTextContents()
  expect(codes).toHaveLength(2)
  const agenda = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:3001",
  })
  await loginApi(agenda, "agenda")
  expect((await agenda.get("/api/admin/feedback")).status()).toBe(403)
  expect(
    (
      await agenda.patch(`/api/admin/feedback/${codes[0]}`, {
        headers,
        data: { status: "selesai", internal_notes: "" },
      })
    ).status()
  ).toBe(403)
  await loginUi(page)
  await page
    .getByRole("button", { name: "Aspirasi privat", exact: true })
    .click()
  await page.getByText("Pesan privat uji", { exact: true }).click()
  await expect(page.locator(".p-preserve").first()).toContainText(
    '<script>alert("xss")</script>'
  )
  await page.getByLabel("Status peninjauan").selectOption("ditinjau")
  await page.getByLabel("Catatan internal").fill("Catatan internal uji")
  await page.getByRole("button", { name: "Simpan Tindak Lanjut" }).click()
  await expect(page.locator(".p-admin-feedback summary")).toContainText(
    "ditinjau"
  )
  const result = await (
    await page.request.get("/api/public?resource=results")
  ).text()
  expect(result).not.toContain("Catatan pribadi")
  expect(result).not.toContain("Catatan internal")
  await page.goto("/privasi#hapus")
  await page.getByLabel("Nomor pesan", { exact: true }).fill(codes[0])
  await page.getByLabel("Kode penghapusan", { exact: true }).fill(codes[1])
  await page.getByRole("button", { name: "Hapus Pesan", exact: true }).click()
  await expect(page.getByRole("status")).toContainText(
    "Permintaan sudah diproses"
  )
  await page.goto("/admin")
  await page
    .getByRole("button", { name: "Aspirasi privat", exact: true })
    .click()
  await expect(page.getByText("Pesan privat uji", { exact: true })).toHaveCount(
    0
  )
  await page.getByRole("button", { name: "Keluar", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Masuk sebagai admin." })
  ).toBeVisible()
  expect((await page.request.get("/api/admin/feedback")).status()).toBe(401)
  await agenda.dispose()
})
test("admin confirms draft, edits agenda, calendar and cancellation", async ({
  page,
}) => {
  await loginUi(page)
  await page.getByRole("button", { name: "Agenda", exact: true }).click()
  await expect(
    page.getByText("Draft · belum dikonfirmasi", { exact: false })
  ).toBeVisible()
  const initial = await (
    await page.request.get("/api/public?resource=agenda")
  ).json()
  expect(
    initial.some((a: { title: string }) => a.title === "Desak RAFIF–DEWA")
  ).toBe(false)
  await page.getByRole("button", { name: "Kelola", exact: true }).click()
  await page
    .getByLabel("Lokasi", { exact: true })
    .fill("Lokasi terverifikasi untuk tes")
  await page.getByRole("checkbox").check()
  await page.getByRole("button", { name: "Simpan Agenda", exact: true }).click()
  await expect(page.getByText("Agenda berhasil disimpan.")).toBeVisible()
  await page.goto("/agenda")
  await page
    .locator("#agenda")
    .getByRole("heading", { name: "Desak RAFIF–DEWA" })
    .click()
  await expect(
    page.locator("#agenda").getByText("Lokasi terverifikasi untuk tes")
  ).toBeVisible()
  const calendar = await page.request.get(
    (await page
      .getByRole("link", { name: "Tambah ke kalender" })
      .getAttribute("href"))!
  )
  expect(calendar.headers()["content-type"]).toContain("text/calendar")
  expect(await calendar.text()).toContain("BEGIN:VEVENT")
  await page.getByRole("button", { name: "Tampilan kalender" }).click()
  await expect(page.locator(".p-calendar-grid")).toBeVisible()
  await page.goto("/admin")
  await page.getByRole("button", { name: "Agenda", exact: true }).click()
  await page.getByRole("button", { name: "Kelola", exact: true }).click()
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("dibatalkan")
  await page.getByRole("button", { name: "Simpan Agenda", exact: true }).click()
  await page.goto("/agenda")
  await expect(
    page.locator("#agenda").getByText("Dibatalkan", { exact: true }).last()
  ).toBeVisible()
  await page
    .locator("#agenda")
    .getByRole("heading", { name: "Desak RAFIF–DEWA" })
    .click()
  await expect(
    page.getByRole("link", { name: "Tambah ke kalender" })
  ).toHaveCount(0)
})

import { expect, test } from "@playwright/test"

test("public pages expose canonical metadata and truthful structured data", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Rafif–Dewa.*KMTSL FT UGM 2026\/2027/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rafifdewa.space"
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "index, follow"
  )
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    "content",
    "id_ID"
  )
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /calon Ketua dan Sekjen KMTSL/
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image"
  )
  await expect(page.locator("h1")).toHaveCount(1)
  const schema = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText()
  )
  expect(
    schema["@graph"].map((entity: { "@type": string }) => entity["@type"])
  ).toEqual(["WebSite", "WebPage", "Person", "Person"])
  expect(schema["@graph"][2].name).toBe("Muhammad Rafif Thalib")
  expect(schema["@graph"][3].sameAs).toContain(
    "https://www.linkedin.com/in/dewatantra/"
  )
  await page.goto("/privasi")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://rafifdewa.space/privasi"
  )
  await expect(page).toHaveTitle("Privasi dan Perlindungan Data | Rafif–Dewa")
  await page.goto("/admin")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow"
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})

test("crawl routes and social image are available while APIs remain noindex", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt")
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain("Disallow: /api/")
  expect(await robots.text()).toContain(
    "Sitemap: https://rafifdewa.space/sitemap.xml"
  )
  const sitemap = await request.get("/sitemap.xml")
  const xml = await sitemap.text()
  expect(sitemap.ok()).toBe(true)
  expect(xml).toContain("<loc>https://rafifdewa.space/</loc>")
  expect(xml).toContain("<loc>https://rafifdewa.space/privasi</loc>")
  expect(xml).not.toMatch(/\/admin|\/api\/|#gagasan/)
  const image = await request.get("/opengraph-image")
  expect(image.ok()).toBe(true)
  expect(image.headers()["content-type"]).toContain("image/png")
  const png = await image.body()
  expect(png.readUInt32BE(16)).toBe(1200)
  expect(png.readUInt32BE(20)).toBe(630)
  const api = await request.get("/api/public")
  expect(api.headers()["x-robots-tag"]).toBe("noindex, nofollow")
})

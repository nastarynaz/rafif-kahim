import { expect, test } from "@playwright/test"

test("keep-alive requires the cron secret and returns no database content", async ({
  request,
}) => {
  for (const path of ["/api/keep-alive", "/api/cron/retention"]) {
    expect((await request.get(path)).status()).toBe(401)
    expect(
      (
        await request.get(path, {
          headers: { Authorization: "Bearer wrong-secret" },
        })
      ).status()
    ).toBe(401)
    const response = await request.get(path, {
      headers: {
        Authorization:
          "Bearer test-only-cron-secret-with-more-than-32-characters",
      },
    })
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ processed: true, keep_alive: true })
    expect(response.headers()["cache-control"]).toContain("no-store")
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow")
  }
})

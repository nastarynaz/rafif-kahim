import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3001",
    reducedMotion: "reduce",
    launchOptions: process.env.TEST_BROWSER_PATH
      ? { executablePath: process.env.TEST_BROWSER_PATH }
      : undefined,
  },
  webServer: [
    {
      command: "pnpm exec tsx tests/fixtures/backend-server.ts",
      url: "http://127.0.0.1:54329/health",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "pnpm exec next start --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        APP_ORIGIN: "http://127.0.0.1:3001",
        SUPABASE_URL: "http://127.0.0.1:54329",
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_only",
        SUPABASE_SECRET_KEY: "sb_secret_test_only",
        RATE_LIMIT_SECRET: "test-only-rate-secret-with-more-than-32-characters",
        CRON_SECRET: "test-only-cron-secret-with-more-than-32-characters",
      },
    },
  ],
})

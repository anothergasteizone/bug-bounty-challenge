import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config for the two genuinely end-to-end flows (login→avatar, language
 * switch + reload persistence). Vitest + RTL covers everything else.
 *
 * One-time setup: `npm install -D @playwright/test && npx playwright install chromium`.
 * Run: `npm run test:e2e` (boots the Vite dev server automatically; needs `.env`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});

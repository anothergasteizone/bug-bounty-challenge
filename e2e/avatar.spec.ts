import { test, expect } from "@playwright/test";

// Demo credentials are inlined into the bundle from .env (see .env.example).
const EMAIL = process.env.VITE_DEMO_USER_EMAIL ?? "linda.bolt@osapiens.com";
const PASSWORD = process.env.VITE_DEMO_USER_PASSWORD ?? "1234";

// Bug 3.3, end-to-end: a real login must make the avatar appear in the app bar,
// and logging out must bring back the "Log in" link.
test.describe("3.3 — avatar in the app bar (E2E)", () => {
  test("login shows the avatar; logout restores the Log in link", async ({
    page
  }) => {
    await page.goto("/login");

    await page.locator("#eMail").fill(EMAIL);
    await page.locator("#password").fill(PASSWORD);
    await page.locator('button[type="submit"]').click();

    // The avatar lives in the shared header (Root layout), so it appears as soon
    // as the store has a user.
    const avatar = page.locator("#avatar-menu-button");
    await expect(avatar).toBeVisible();

    // Move to home (the session persists via mst-persist) so the only "Logout"
    // is the avatar menu's — the /login page has its own session-card logout.
    await page.goto("/");
    await expect(avatar).toBeVisible();

    // Logout from the avatar menu -> back to the anonymous state.
    await avatar.click();
    await page.getByRole("button", { name: /logout/i }).click();

    // Target the login link by href: the app-title link's text can also contain
    // "Log in" when the page title is the login route.
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(avatar).toHaveCount(0);
  });
});

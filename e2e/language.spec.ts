import { test, expect } from "@playwright/test";

// Bug 3.5, end-to-end: the chosen language must survive a real page reload
// (persisted in localStorage by i18next's language detector). This is the one
// part that a jsdom test can't exercise — it needs a real browser reload.
test.describe("3.5 — language persists across reload (E2E)", () => {
  test("switching to Spanish survives a reload", async ({ page }) => {
    await page.goto("/");

    // The switcher's label is "Change language" in the default English.
    await page.getByRole("button", { name: /change language/i }).click();
    // At English, Intl.DisplayNames labels the Spanish option "Spanish".
    await page.getByRole("menuitem", { name: /spanish/i }).click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("i18nextLng")))
      .toBe("es");

    await page.reload();

    // After the reload the app is still Spanish: the switcher now renders the
    // Spanish display name for Spanish ("Español").
    await expect(page.locator("button", { hasText: "Español" })).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("i18nextLng"))
    ).toBe("es");
  });
});

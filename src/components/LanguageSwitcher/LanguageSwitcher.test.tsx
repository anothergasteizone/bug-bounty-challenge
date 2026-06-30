import { describe, it, expect } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  i18n
} from "../../test/test-utils";
import LanguageSwitcher from "./index";

// Bug 3.5 — the language switcher lets the user change language (labels via
// Intl.DisplayNames) and persists the choice to localStorage.
describe("LanguageSwitcher (bug 3.5)", () => {
  it("shows the current language label (Intl.DisplayNames)", () => {
    renderWithProviders(<LanguageSwitcher />);
    // Intl.DisplayNames(["en"]).of("en") === "English"
    expect(
      screen.getByRole("button", { name: /change language/i })
    ).toHaveTextContent("English");
  });

  it("lists every supported language in the menu", async () => {
    renderWithProviders(<LanguageSwitcher />);
    await userEvent.click(
      screen.getByRole("button", { name: /change language/i })
    );
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("switches language and persists the choice to localStorage", async () => {
    renderWithProviders(<LanguageSwitcher />);

    await userEvent.click(
      screen.getByRole("button", { name: /change language/i })
    );
    // At "en" the menu labels are in English; pick "German".
    await userEvent.click(screen.getByRole("menuitem", { name: /german/i }));

    await waitFor(() => {
      expect(i18n.language).toBe("de");
      // Detector caches the choice (detection.caches: ["localStorage"]).
      expect(localStorage.getItem("i18nextLng")).toBe("de");
    });

    // The aria-label is itself translated after the switch, so query the single
    // switcher button by role and assert its label text is the German display
    // name for German ("Deutsch").
    expect(screen.getByRole("button")).toHaveTextContent("Deutsch");
  });
});

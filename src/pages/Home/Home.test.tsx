import { describe, it, expect, vi, afterEach } from "vitest";
import { renderWithProviders, screen, act, i18n } from "../../test/test-utils";
import Home from "./index";

describe("Home page", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Bug 3.1 — the `.map()` over `issues` used to render <ListItem> without a key,
  // producing React's "Each child in a list should have a unique key" warning.
  describe('3.1 — list items render without the missing-"key" warning', () => {
    it("does not emit React's unique-key warning", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      renderWithProviders(<Home />);

      const keyWarning = errorSpy.mock.calls.find((args) =>
        args.some(
          (arg) => typeof arg === "string" && /unique "key" prop/.test(arg)
        )
      );
      expect(keyWarning).toBeUndefined();
    });

    it("renders all five known issues as list items", () => {
      // The static ESLint rule `react/jsx-key` (plugin:react/recommended, already
      // enabled in .eslintrc.cjs) is the strongest guarantee against a missing
      // key; this is the runtime safety net that the list itself stays intact.
      renderWithProviders(<Home />);
      expect(screen.getAllByRole("listitem")).toHaveLength(5);
    });
  });

  // Bug 3.2 — "known" must be bold, achieved with <Trans components={{ b: <b/> }}>
  // WITHOUT editing the locale strings (which keep the literal <b>…</b> markup).
  describe('3.2 — the word is rendered bold via <Trans>, per language', () => {
    it("wraps the English word in a <b> element", () => {
      const { container } = renderWithProviders(<Home />);
      const bold = container.querySelector("b");
      expect(bold).not.toBeNull();
      expect(bold).toHaveTextContent("known");
    });

    it("keeps the correct word bold when the language changes", async () => {
      const { container } = renderWithProviders(<Home />);

      // German leaves the term untranslated → still "known".
      await act(async () => {
        await i18n.changeLanguage("de");
      });
      expect(container.querySelector("b")).toHaveTextContent("known");

      // Spanish translates it → "conocidos". The bold still tracks the term.
      await act(async () => {
        await i18n.changeLanguage("es");
      });
      expect(container.querySelector("b")).toHaveTextContent("conocidos");
    });
  });
});

import { describe, it, expect } from "vitest";
import en from "./locales/en.json";
import de from "./locales/de.json";
import es from "./locales/es.json";

// Bug 3.2 had a hard constraint: "do not change the i18n text". The bold is
// produced at render time by <Trans>, so the embedded markup must stay in the
// locale files. This guards against anyone "fixing" the bold by editing the JSON.
describe("3.2 — locale text must stay unaltered", () => {
  it("keeps the literal <b>known</b> markup in English and German", () => {
    expect(en.home.intro).toContain("<b>known</b>");
    expect(de.home.intro).toContain("<b>known</b>");
  });

  it("keeps the translated <b>conocidos</b> markup in Spanish", () => {
    expect(es.home.intro).toContain("<b>conocidos</b>");
  });

  it("defines all five known-issue keys used by the Home list", () => {
    for (const key of [
      "consoleKey",
      "boldKnown",
      "avatarMissing",
      "countdown",
      "languageSwitch"
    ]) {
      expect(en.home.issues).toHaveProperty(key);
    }
  });
});

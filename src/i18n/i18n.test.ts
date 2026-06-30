import { describe, it, expect } from "vitest";
import { supportedLngs } from "./i18n";

// Bug 3.5 — languages are auto-discovered from ./locales/*.json via
// import.meta.glob, so `supportedLngs` should reflect every shipped locale.
describe("3.5 — i18n auto-loads every locale file", () => {
  it("exposes en, de and es as supported languages", () => {
    expect(supportedLngs).toHaveLength(3);
    expect(supportedLngs).toEqual(expect.arrayContaining(["en", "de", "es"]));
  });
});

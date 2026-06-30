import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import i18n from "../i18n";

// i18n and the MST user store are module-level singletons. Reset shared state
// after every test so language/persistence choices don't bleed between tests
// (i18next caches the active language in localStorage["i18nextLng"]).
afterEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("en");
});

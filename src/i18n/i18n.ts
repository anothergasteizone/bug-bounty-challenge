import i18n from "i18next";
import cloneDeep  from "lodash/cloneDeep";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

export const FALLBACK_LANGUAGE = "en";

const getBrowserLanguage = () => {
    const userLang = navigator.language;
    return userLang ? userLang.split("-")[0] : FALLBACK_LANGUAGE;
};

// Load all available languages.
const localeModules = import.meta.glob<{ default: Record<string, unknown> }>(
    "./locales/*.json",
    { eager: true }
);
const resources = Object.entries(localeModules).reduce(
    (acc, [path, mod]) => {
        // path es algo como "./locales/es.json" -> extraemos "es"
        const code = path.match(/\.\/locales\/(.+)\.json$/)?.[1];
        if (code) {
            acc[code] = { app: cloneDeep(mod.default) };
        }
        return acc;
    },
    {} as Record<string, { app: Record<string, unknown> }>
);

export const supportedLngs = Object.keys(resources);

// Usamos el idioma del navegador como fallback solo si está soportado
const browserLanguage = getBrowserLanguage();
const resolvedFallbackLng = supportedLngs.includes(browserLanguage)
    ? browserLanguage
    : FALLBACK_LANGUAGE;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        supportedLngs,
        ns: ["app"],
        defaultNS: "app",
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            lookupLocalStorage: "i18nextLng"
        },
        fallbackLng: resolvedFallbackLng,
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
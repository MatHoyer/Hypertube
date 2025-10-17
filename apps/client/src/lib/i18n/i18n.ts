import { enZod, esZod, frZod, languageCodesArray } from "@hypertube/libs";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import z from "zod";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";

export const resources = {
  en: {
    translation: { ...en, ...enZod },
  },
  fr: {
    translation: { ...fr, ...frZod },
  },
  es: {
    translation: { ...es, ...esZod },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ["cookie", "navigator"],
      lookupCookie: "language",
      cookieMinutes: 365 * 24 * 60,
      caches: ["cookie"],
      convertDetectedLanguage: (lang) => lang.split("-")[0],
    },
    supportedLngs: languageCodesArray,
    fallbackLng: "en",
    resources,
  });

const zodLocales = {
  en: z.locales.en(),
  fr: z.locales.fr(),
  es: z.locales.es(),
};

i18n.on("languageChanged", (lng) => {
  z.config(zodLocales[lng as keyof typeof zodLocales]);
  console.log(lng);
});

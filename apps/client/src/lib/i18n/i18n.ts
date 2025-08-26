import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import z from "zod";
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json"

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  es: {
    translation: es,
  },
};

i18n.use(initReactI18next).use(LanguageDetector).init({
  lng: "en",
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
});

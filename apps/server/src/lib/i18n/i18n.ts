import { enZod, esZod, frZod } from "@hypertube/libs";
import i18n from "i18next";
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

i18n.init({
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

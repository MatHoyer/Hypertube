import { enZod, esZod, frZod } from "@hypertube/libs";
import i18n from "i18next";
import z from "zod";
import enGlobal from "./en/global.json";
import enJob from "./en/job.json";
import esGlobal from "./es/global.json";
import esJob from "./es/job.json";
import frGlobal from "./fr/global.json";
import frJob from "./fr/job.json";

export const resources = {
  en: {
    translation: { ...enGlobal, ...enJob, ...enZod },
  },
  fr: {
    translation: { ...frGlobal, ...frJob, ...frZod },
  },
  es: {
    translation: { ...esGlobal, ...esJob, ...esZod },
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

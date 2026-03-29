import { languageCodes } from "@hypertube/libs";

export type TSupportedLanguage = {
  Variables: { language: keyof typeof languageCodes };
};

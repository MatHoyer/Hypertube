import { languageCodes } from "@hypertube/libs";

export type TIsSupportedLanguage = {
  Variables: { language: keyof typeof languageCodes };
};

import "react-i18next";
import en from "./lib/i18n/en/global.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "en";
    resources: {
      en: typeof en;
    };
  }
}

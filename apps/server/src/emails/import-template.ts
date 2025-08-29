import { getYear } from "date-fns";
import * as fs from "fs";
import i18next from "i18next";
import * as path from "path";

const keyToReplace = {
  title: "{{title}}",
  content: "{{content}}",
  link: "{{link}}",
  linkText: "{{linkText}}",
  year: "{{year}}",

  ignoreEmail: "{{ignoreEmail}}",
  allRightsReserved: "{{allRightsReserved}}",
};

const template = fs.readFileSync(
  path.join(__dirname, "default-email.html"),
  "utf-8"
);

type MailValues = {
  title: string;
  content: string;
  link: string;
  linkText: string;
  year?: string;

  ignoreEmail?: string;
  allRightsReserved?: string;
};

type MailConfig = Partial<{
  language: string;
}>;

export const mailTemplate = (values: MailValues, config?: MailConfig) => {
  return template
    .replace(
      keyToReplace.ignoreEmail,
      i18next.t("email.ignoreEmail", { lng: config?.language })
    )
    .replace(
      keyToReplace.allRightsReserved,
      i18next.t("email.allRightsReserved", { lng: config?.language })
    )
    .replace(keyToReplace.title, values.title)
    .replace(keyToReplace.content, values.content)
    .replace(keyToReplace.link, values.link)
    .replace(keyToReplace.linkText, values.linkText)
    .replace(keyToReplace.year, values.year ?? "" + getYear(new Date()));
};

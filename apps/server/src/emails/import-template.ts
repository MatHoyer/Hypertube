import { getYear } from "date-fns";
import * as fs from "fs";
import * as path from "path";

const keyToReplace = {
  title: "{{title}}",
  content: "{{content}}",
  link: "{{link}}",
  linkText: "{{linkText}}",
  year: "{{year}}",
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
};

type MailConfig = {
  language: string;
};

export const mailTemplate = (values: MailValues, config: MailConfig) => {
  console.log(config);

  return template
    .replace(keyToReplace.title, values.title)
    .replace(keyToReplace.content, values.content)
    .replace(keyToReplace.link, values.link)
    .replace(keyToReplace.linkText, values.linkText)
    .replace(keyToReplace.year, values.year ?? "" + getYear(new Date()));
};

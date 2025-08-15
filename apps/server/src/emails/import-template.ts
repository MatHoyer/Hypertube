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

export const mailTemplate = (
  title: string,
  content: string,
  link: string,
  linkText: string,
  year?: string
) => {
  return template
    .replace(keyToReplace.title, title)
    .replace(keyToReplace.content, content)
    .replace(keyToReplace.link, link)
    .replace(keyToReplace.linkText, linkText)
    .replace(keyToReplace.year, year ?? getYear(new Date()).toString());
};

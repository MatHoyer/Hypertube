import * as fs from "fs";
import * as path from "path";

export const keyToReplace = {
  title: "{{title}}",
  content: "{{content}}",
  link: "{{link}}",
  linkText: "{{linkText}}",
  year: "{{year}}",
};

export const template = fs.readFileSync(
  path.join(__dirname, "default-email.html"),
  "utf-8"
);

import fs from "fs";
import path from "path";

export const template = fs.readFileSync(
  path.join(__dirname, "default-email.html"),
  "utf-8"
);

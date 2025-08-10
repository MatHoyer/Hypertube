import fs from "fs";
import path from "path";

export const renameFile = (filePath: string, newName: string) => {
  const newPath = path.join(path.dirname(filePath), newName);
  if (fs.existsSync(filePath) && filePath !== newPath) {
    fs.renameSync(filePath, newPath);
  }
};

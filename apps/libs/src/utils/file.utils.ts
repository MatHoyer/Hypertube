import * as fs from "fs";
import * as path from "path";

export const renameFile = (filePath: string, newName: string) => {
  const newPath = path.join(path.dirname(filePath), newName);
  if (fs.existsSync(filePath) && filePath !== newPath) {
    fs.renameSync(filePath, newPath);
  }
};

export const waitFile = async (filePath: string, msTimeout = 15000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (fs.existsSync(filePath)) {
        resolve();
      } else if (Date.now() - startTime > msTimeout) {
        reject(new Error(`Download timeout after ${msTimeout}ms`));
      } else {
        setTimeout(check, 200);
      }
    };

    check();
  });
};

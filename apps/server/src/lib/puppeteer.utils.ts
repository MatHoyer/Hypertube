import fs from "fs";

export const waitFile = async (filePath: string, timeout = 15000) => {
  return new Promise<void>(async (resolve, reject) => {
    const startTime = Date.now();

    const check = async () => {
      if (fs.existsSync(filePath)) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Download timeout after ${timeout}ms`));
      } else {
        setTimeout(check, 200);
      }
    };

    await check();
  });
};

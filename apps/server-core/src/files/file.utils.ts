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

export const convertSrtToVtt = async (srtPath: string) => {
  const srtData = await fs.promises.readFile(srtPath, "utf8");

  // Replace the timecode format from 00:00:00,000 to 00:00:00.000
  let vttData = "WEBVTT\n\n" + srtData.replace(/(\d+:\d+:\d+),(\d+)/g, "$1.$2");

  // Remove number lines
  vttData = vttData.replace(/^\d+\s*[\r\n]+/gm, "");

  const vttPath = path.join(path.dirname(srtPath), "subtitles.vtt");
  await fs.promises.writeFile(vttPath, vttData, {
    encoding: "utf8",
    flag: "w",
  });
  await fs.promises.unlink(srtPath);
};

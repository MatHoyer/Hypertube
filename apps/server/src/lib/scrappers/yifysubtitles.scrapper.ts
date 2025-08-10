import type { Subtitle } from "@prisma/client";
import path from "path";
import puppeteer from "puppeteer";
import { getSubtitleFolderPath } from "../movie-folder-gestion/subtitle";
import { renameFile } from "../movie-folder-gestion/utils";
import prisma from "../prisma";
import { waitFile } from "../puppeteer.utils";

const yifysubtitlesUrl = "https://yifysubtitles.ch";

// Movie id is like: tt0816692
export const getSubtitlesDownloadLinks = async ({
  endpoint,
  isCompleteUrl = false,
}: {
  endpoint: string;
  isCompleteUrl?: boolean;
}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    isCompleteUrl ? endpoint : `${yifysubtitlesUrl}/movie-imdb/${endpoint}`
  );

  const trs = await page.$$("tr");

  const subtitlesDownloadLinks = await Promise.all(
    trs.map(async (tr) => {
      const tds = await tr.$$("td");
      if (tds.length < 5) return null;

      const rating = parseInt(
        await tds[0].$eval("span.label", (el) => el.textContent ?? "0")
      );
      if (rating < 1) return null;

      const language = await tds[1].$eval(
        "span.sub-lang",
        (el) => el.textContent
      );
      const link = await tds[2].$eval("a", (el) => el.href);

      return {
        language,
        rating: rating,
        link,
      };
    })
  );

  await browser.close();

  return subtitlesDownloadLinks.filter(
    (
      subtitle
    ): subtitle is { language: string; rating: number; link: string } =>
      !!subtitle && !!subtitle.link && !!subtitle.language && !!subtitle.rating
  );
};

export const downloadSubtitles = async (subtitlesId: Subtitle["id"]) => {
  const subtitle = await prisma.subtitle.findUnique({
    where: {
      id: subtitlesId,
    },
  });
  if (!subtitle) {
    throw new Error("Subtitle not found");
  }
  console.log(subtitle);

  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: getSubtitleFolderPath(subtitle.movieId!, subtitle.language),
  });

  await page.goto(subtitle.link);

  await page.waitForSelector("a.btn-icon.download-subtitle");

  // Get original filename before download
  const originalHref = await page.$eval(
    "a.btn-icon.download-subtitle",
    (el) => el.href
  );
  const originalFilename = originalHref.split("/").pop();
  if (!originalFilename) {
    throw new Error("Original filename not found");
  }

  // Download the file
  await page.click("a.btn-icon.download-subtitle");

  const downloadDir = getSubtitleFolderPath(
    subtitle.movieId!,
    subtitle.language
  );
  const originalPath = path.join(downloadDir, originalFilename);

  // Wait for original file to download
  await waitFile(originalPath, 3000);

  renameFile(originalPath, "subtitles.zip");

  await browser.close();
};

import {
  formatUnknownError,
  hypertubeLogger,
  TSubtitleSchema,
} from "@hypertube/libs";
import {
  BUCKETS,
  convertSrtToVtt,
  getStoragePath,
  renameFile,
  waitFile,
} from "@hypertube/server-core";
import AdmZip from "adm-zip";
import * as fs from "fs";
import * as path from "path";
import { storageClient } from "../main";
import { launchPuppeteer } from "./scrappers.utils";

const yifysubtitlesUrl = "https://yifysubtitles.ch/movie-imdb/";

// imdbId is like: tt0816692
export const getSubtitlesDownloadLinks = async ({
  imdbId,
}: {
  imdbId: string;
}) => {
  let browser: Awaited<ReturnType<typeof launchPuppeteer>> | null = null;

  try {
    browser = await launchPuppeteer();
    const page = await browser.newPage();
    await page.goto(`${yifysubtitlesUrl}${imdbId}`);

    const trs = await page.$$("tr");

    hypertubeLogger.info(`Found ${trs.length} potential subtitles`);
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

        hypertubeLogger.info(`Found rating ${rating} for language ${language}`);

        return {
          language,
          rating: rating,
          link,
        };
      })
    );

    // Keep only one of each language with the highest rating
    const filtered = subtitlesDownloadLinks
      .filter(
        (
          subtitle
        ): subtitle is { language: string; rating: number; link: string } =>
          !!subtitle &&
          !!subtitle.link &&
          !!subtitle.language &&
          !!subtitle.rating
      )
      .reduce(
        (acc, subtitle) => {
          const existing = acc.find((s) => s.language === subtitle.language);
          if (!existing || subtitle.rating > existing.rating) {
            return [
              ...acc.filter((s) => s.language !== subtitle.language),
              subtitle,
            ];
          }
          return acc;
        },
        [] as { language: string; rating: number; link: string }[]
      );
    return filtered;
  } catch (error) {
    hypertubeLogger.error(
      `Error getting subtitles download links: ${formatUnknownError(error)}`
    );
    return [];
  } finally {
    await browser?.close();
  }
};

export const downloadYifysubtitles = async (
  subtitles: TSubtitleSchema & { tmdbId: number }
) => {
  const browser = await launchPuppeteer();

  const page = await browser.newPage();

  const id = `${subtitles.tmdbId}-${subtitles.language}`;
  const downloadPath = `/downloads/${id}`;
  await fs.promises.mkdir(downloadPath, { recursive: true });

  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloadPath,
  });

  await page.goto(subtitles.downloadLink);

  await page.waitForSelector("a.btn-icon.download-subtitle");

  const originalHref = await page.$eval(
    "a.btn-icon.download-subtitle",
    (el) => el.href
  );
  const originalFilename = originalHref.split("/").pop();
  if (!originalFilename) {
    throw new Error("Original filename not found");
  }

  await page.click("a.btn-icon.download-subtitle");

  const originalPath = path.join(downloadPath, originalFilename);

  await waitFile(originalPath, 3000);

  await browser.close();

  renameFile(originalPath, "subtitles.zip");
  const zipPath = path.join(downloadPath, "subtitles.zip");

  const zipper = new AdmZip(zipPath);
  const entries = zipper.getEntries();
  const srtEntry = entries.find((e) =>
    e.entryName.toLowerCase().endsWith(".srt")
  );
  if (!srtEntry) {
    throw new Error("SRT file not found");
  }
  const srtFilename = path.basename(srtEntry.entryName);
  const srtFilePath = path.join(downloadPath, srtFilename);
  await fs.promises.writeFile(srtFilePath, srtEntry.getData());
  await fs.promises.unlink(zipPath);

  const vttFilePath = await convertSrtToVtt(srtFilePath);

  await storageClient.putObject(
    BUCKETS.MOVIES,
    getStoragePath(
      subtitles.tmdbId.toString(),
      "subtitles",
      subtitles.language,
      "subtitles.vtt"
    ),
    await fs.promises.readFile(vttFilePath)
  );

  await fs.promises.rm(downloadPath, { recursive: true, force: true });
};

import { resolutionSchemas } from "@hypertube/libs";
import type { Resolution } from "@prisma/client";
import puppeteer, { Page } from "puppeteer";
import type z from "zod";
import { getResolutionFolderPath } from "../movie-folder-gestion/resolution";
import prisma from "../prisma";

export abstract class Scrapper {
  url: string;
  currentUrl: string | null;
  currentSearchParams: Record<string, string>;
  currentUrlParams: Record<string, string>;

  protected constructor(url: string) {
    this.url = url;
    this.currentUrl = null;
    this.currentSearchParams = {};
    this.currentUrlParams = {};
  }

  protected async init() {
    await this.filterScrape();
  }

  createSearchParams() {
    return new URLSearchParams(this.currentSearchParams).toString();
  }

  setCurrentUrl(url: string) {
    let cmpUrl = url;
    if (url && typeof url === "string") {
      const lastDot = url.lastIndexOf(".");
      if (lastDot > 0) {
        cmpUrl = url.substring(0, lastDot);
      }
    }

    if (!this.url.startsWith(cmpUrl)) return;

    this.currentUrl = url;
  }

  async defaultScrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${this.url}?${this.createSearchParams()}`);

    const data = await this.scrape(page);

    await browser.close();

    return data;
  }

  protected abstract scrape(page: Page): Promise<
    {
      title: string;
      link: string;
      imageUrl: string;
    }[]
  >;

  async filterScrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(this.url);

    const searchParamsOptions = await this.getFiltersScrape(page);

    await browser.close();

    return searchParamsOptions;
  }

  protected abstract getFiltersScrape(
    page: Page
  ): Promise<Record<string, { label: string; value: string }[]>>;

  async paginationScrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${this.url}?${this.createSearchParams()}`);

    const maxPagination = await this.getPaginationScrape(page);

    await browser.close();

    return maxPagination;
  }

  protected abstract getPaginationScrape(page: Page): Promise<number>;

  async movieDataScrape() {
    if (!this.currentUrl) return null;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(this.currentUrl);

    const movieData = await this.getMovieDataScrape(page);

    await browser.close();

    return movieData;
  }

  protected abstract getMovieDataScrape(page: Page): Promise<{
    resolutions: Omit<z.infer<typeof resolutionSchemas>, "id">[];
    subtitlesLink: string;
  }>;

  async downloadResolution(resolutionId: Resolution["id"]) {
    const resolution = await prisma.resolution.findUnique({
      where: {
        id: resolutionId,
      },
    });
    if (!resolution) {
      throw new Error("Resolution not found");
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const client = await page.createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: getResolutionFolderPath(
        resolution.movieId!,
        resolution.resolution
      ),
    });

    await this.downloadRes(page, resolution);

    await browser.close();
  }

  protected abstract downloadRes(
    page: Page,
    resolution: Resolution
  ): Promise<void>;
}

import puppeteer, { Page } from "puppeteer";

export abstract class Scrapper {
  url: string;
  currentUrl: string | null;
  currentSearchParams: Record<string, string>;
  searchParamsOptions: Record<string, string[]> | null;
  maxPagination: number;

  protected constructor(url: string) {
    this.url = url;
    this.currentUrl = null;
    this.currentSearchParams = {};
    this.searchParamsOptions = null;
    this.maxPagination = 1;
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
  ): Promise<Record<string, string[]>>;

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
    resolutions: {
      resolution: string;
      size: string;
      link: string;
    }[];
    subtitlesLink: string;
  }>;
}

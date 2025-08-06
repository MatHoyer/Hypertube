import puppeteer, { Browser, Page } from "puppeteer";

export abstract class Scrapper {
  url: string;
  currentSearchParams: Record<string, string>;
  searchParamsOptions: Record<string, string[]>;
  browser: Browser | null;

  protected constructor(url: string) {
    this.url = url;
    this.currentSearchParams = {};
    this.searchParamsOptions = {};
    this.browser = null;
  }

  async init() {
    await this.filterScrape();
  }

  createSearchParams() {
    return new URLSearchParams(this.currentSearchParams).toString();
  }

  async defaultScrape() {
    this.browser = await puppeteer.launch();
    const page = await this.browser.newPage();
    await page.goto(`${this.url}?${this.createSearchParams()}`);

    const data = await this.scrape(page);

    await this.browser?.close();
    return data;
  }

  abstract scrape(page: Page): Promise<any>;

  async filterScrape() {
    this.browser = await puppeteer.launch();
    const page = await this.browser.newPage();
    await page.goto(this.url);

    this.searchParamsOptions = await this.getFiltersScrape(page);

    await this.browser?.close();
  }

  abstract getFiltersScrape(page: Page): Promise<Record<string, string[]>>;
}

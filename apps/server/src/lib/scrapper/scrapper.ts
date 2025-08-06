import puppeteer, { Page } from "puppeteer";

export abstract class Scrapper {
  url: string;
  currentSearchParams: Record<string, string>;
  searchParamsOptions: Record<string, string[]>;

  protected constructor(url: string) {
    this.url = url;
    this.currentSearchParams = {};
    this.searchParamsOptions = {};
  }

  async init() {
    await this.filterScrape();
  }

  createSearchParams() {
    return new URLSearchParams(this.currentSearchParams).toString();
  }

  async defaultScrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${this.url}?${this.createSearchParams()}`);

    const data = await this.scrape(page);

    await browser.close();
    return data;
  }

  abstract scrape(page: Page): Promise<any>;

  async filterScrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(this.url);

    this.searchParamsOptions = await this.getFiltersScrape(page);

    await browser.close();
  }

  abstract getFiltersScrape(page: Page): Promise<Record<string, string[]>>;
}

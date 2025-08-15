import { convertObjectToSearchParams } from "@hypertube/libs";
import puppeteer, { Page } from "puppeteer";

export abstract class Scrapper<T extends Record<string, any>> {
  url: string;
  currentUrl: string | null;
  currentSearchParams: Record<string, any>;
  currentUrlParams: T;

  protected constructor(url: string) {
    this.url = url;
    this.currentUrl = null;
    this.currentSearchParams = {};
    this.currentUrlParams = {} as T;
  }

  createSearchParams() {
    return convertObjectToSearchParams(this.currentSearchParams);
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
      year: number;
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
}

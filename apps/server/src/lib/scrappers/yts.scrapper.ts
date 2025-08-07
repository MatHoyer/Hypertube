import type { Page } from "puppeteer";
import { Scrapper } from "./scrapper";

const defaultYtsSearchParams = {
  keyword: "interstellar",
  quality: "All",
  genre: "all",
  rating: "0",
  year: "0",
  language: "all",
  sort_by: "latest",
  page: "1",
};

const ytsUrl = "https://yts.pro/";

export class YtsScrapper extends Scrapper {
  constructor() {
    super(ytsUrl);
    this.currentSearchParams = defaultYtsSearchParams;
  }

  static async create() {
    const instance = new YtsScrapper();
    await instance.init();
    return instance;
  }

  protected async scrape(page: Page) {
    const container = await page.$("section");
    const rows = await container?.$$("div.row");
    const movies = await Promise.all(
      rows?.map(async (row) => {
        const movies = await row?.$$(
          "div.browse-movie-wrap.col-xs-10.col-sm-4.col-md-5.col-lg-4"
        );
        return await Promise.all(
          movies.map(async (movie) => {
            return {
              title: await movie?.$eval("a", (el) => el.title),
              link: await movie?.$eval("a", (el) => el.href),
              image: await movie?.$eval("img", (el) => el.src),
            };
          })
        );
      }) ?? []
    );
    return movies.flat();
  }

  protected async getFiltersScrape(page: Page) {
    const selectContainers = await page.$$("div.selects-container");
    const filters = await Promise.all(
      selectContainers.map(async (container) => {
        const label = await container.$eval("p", (el) => el.textContent);
        const select = await container.$("select");
        const options = await select?.$$("option");
        return {
          [label ?? ""]: options
            ? await Promise.all(
                options.map((option) =>
                  option.evaluate((el) => el.textContent ?? "")
                )
              )
            : [],
        };
      })
    );

    return filters
      .filter((filter) => {
        const filterValues = Object.values(filter)[0] ?? [];
        return filter !== undefined && filterValues.every((value) => !!value);
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});
  }
}

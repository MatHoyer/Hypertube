import type { Page } from "puppeteer";
import { Scrapper } from "./scrapper";

const defaultYtsSearchParams = {
  keyword: "",
  quality: "All",
  genre: "all",
  rating: "0",
  year: "0",
  language: "all",
  sort_by: "latest",
};

const ytsUrl = "https://yts.pro/";

export class YtsScrapper extends Scrapper {
  private constructor(url: string) {
    super(url);
  }

  static async create() {
    const instance = new YtsScrapper(ytsUrl);
    await instance.init();
    return instance;
  }

  async scrape(page: Page) {
    return {};
  }

  async getFiltersScrape(page: Page) {
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

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

  protected async getPaginationScrape(page: Page) {
    const pagination = await page.$(
      "ul.tsc_pagination.tsc_paginationA.tsc_paginationA06"
    );
    if (!pagination) return 1;

    const paginationItems = await pagination.$$("li");
    if (!paginationItems) return 1;

    const paginationNumbers = (
      await Promise.all(
        paginationItems.map(async (item) => {
          try {
            const number = await item.$eval("a", (el) => el.title);
            return number;
          } catch (error) {
            return null;
          }
        }) ?? []
      )
    ).filter(
      (number): number is string =>
        number !== null && typeof number === "string" && /^\d+$/.test(number)
    );

    return Math.max(...paginationNumbers.map((number) => parseInt(number)), 1);
  }

  protected async getMovieDataScrape(page: Page) {
    const container = await page.$("#movie-info");
    const resolutionContainers = await container?.$$(
      "a.torrent-modal-download"
    );

    if (resolutionContainers && resolutionContainers.length > 0) {
      // Ensure element is visible and interactable
      await page.evaluate((element) => {
        element.scrollIntoView();
      }, resolutionContainers[0]);

      await new Promise((resolve) => setTimeout(resolve, 500));
      await page.click("a.torrent-modal-download");

      // Wait for the modal to appear
      await page.waitForSelector("div.modal-content", {
        visible: true,
        timeout: 5000,
      });
    }

    const modal = await page.$("div.modal-content");
    const resolutionLinkContainers = await modal?.$$("div.modal-torrent");
    const resolutions = await Promise.all(
      resolutionLinkContainers?.map(async (container) => {
        const qualityPs = await container?.$$("p.quality-size");

        return {
          resolution: await container?.$eval(
            "div.modal-quality span",
            (el) => el.textContent
          ),
          size: await qualityPs?.[1]?.evaluate((el) => el.textContent?.trim()),
          link: await container?.$eval("a.download-torrent", (el) => el.href),
        };
      }) ?? []
    );

    const subtitlesLink = await container?.$eval("a.button", (el) => el.href);

    return {
      resolutions,
      subtitlesLink,
    };
  }
}

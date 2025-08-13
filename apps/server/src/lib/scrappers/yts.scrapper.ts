import type { TYtsScrapperSearchParamsSchemas } from "@hypertube/libs";
import type { Page } from "puppeteer";
import { Scrapper } from "./scrapper";

const defaultYtsSearchParams = {
  page: "1",
};
const defaultYtsFilters: TYtsScrapperSearchParamsSchemas = {
  keyword: "0",
  quality: "all",
  genre: "all",
  rating: 0,
  sort_by: "latest",
  year: "0",
  language: "all",
};

const ytsUrl = "https://yts.mx/browse-movies";

export class YtsScrapper extends Scrapper<TYtsScrapperSearchParamsSchemas> {
  constructor() {
    super(ytsUrl);
    this.currentSearchParams = defaultYtsSearchParams;
    this.currentUrlParams = defaultYtsFilters;
  }

  static async create() {
    const instance = new YtsScrapper();
    await instance.init();
    return instance;
  }

  updateUrlParams(params: TYtsScrapperSearchParamsSchemas) {
    this.currentUrlParams = { ...this.currentUrlParams, ...params };
  }

  createUrl() {
    let isModifiedRequest = false;

    for (const [key, value] of Object.entries(this.currentUrlParams)) {
      if (
        key in defaultYtsFilters &&
        value !== defaultYtsFilters[key as keyof typeof defaultYtsFilters]
      ) {
        isModifiedRequest = true;
      }
    }

    if (isModifiedRequest) {
      this.url =
        ytsUrl +
        "/" +
        [
          this.currentUrlParams.keyword,
          this.currentUrlParams.quality,
          this.currentUrlParams.genre,
          this.currentUrlParams.rating,
          this.currentUrlParams.sort_by,
          this.currentUrlParams.year,
          this.currentUrlParams.language,
        ].join("/");
    }
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
            const bottomContainer = await movie.$("div.browse-movie-bottom");
            if (!bottomContainer) return null;

            const yearString = await bottomContainer?.$eval(
              "div",
              (el) => el.textContent
            );
            const year = yearString ? parseInt(yearString.trim()) : undefined;

            return {
              title: await bottomContainer?.$eval("a", (el) => {
                const span = el.querySelector("span");
                span?.remove();
                return el.textContent?.trim() ?? "";
              }),
              year,
              link: await bottomContainer?.$eval("a", (el) => el.href),
              imageUrl: await movie?.$eval("img", (el) => el.src),
            };
          })
        );
      }) ?? []
    );
    return movies.flat().filter(
      (
        movie
      ): movie is {
        title: string;
        year: number;
        link: string;
        imageUrl: string;
      } =>
        !!movie &&
        !!movie.title &&
        !!movie.link &&
        !!movie.imageUrl &&
        !!movie.year
    );
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
                options.map(async (option) => ({
                  label: await option.evaluate((el) => el.textContent ?? ""),
                  value: await option.evaluate((el) => el.value ?? ""),
                }))
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
            const number = await item.$eval("a", (el) => el.textContent);
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
}

import type { TYtsScrapperSearchParamsSchemas } from "@hypertube/libs";
import puppeteer from "puppeteer";

const ytsUrl = "https://yts.mx/browse-movies";

const getYtsUrl = (params: TYtsScrapperSearchParamsSchemas) => {
  const orderedParams = [
    params.keyword,
    params.quality,
    params.genre,
    params.rating,
    params.sort_by,
    params.year,
    params.language,
  ];

  return ytsUrl + "/" + orderedParams.join("/");
};

const createPuppeteer = async (url: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  return {
    page,
    browser,
  };
};

export const scrapeYtsMovies = async (
  params: TYtsScrapperSearchParamsSchemas,
  pageNumber: number
) => {
  const url = getYtsUrl(params) + (pageNumber > 1 ? `?page=${pageNumber}` : "");

  const { page, browser } = await createPuppeteer(url);

  // ----------------------------- SCRAPE -----------------------------
  const container = await page.$("section");
  if (!container) return [];

  const rows = await container.$$("div.row");

  const movies = await Promise.all(
    rows.map(async (row) => {
      const movies = await row.$$(
        "div.browse-movie-wrap.col-xs-10.col-sm-4.col-md-5.col-lg-4"
      );

      return await Promise.all(
        movies.map(async (movie) => {
          const bottomContainer = await movie.$("div.browse-movie-bottom");
          if (!bottomContainer) return null;

          const yearString = await bottomContainer.$eval(
            "div",
            (el) => el.textContent
          );
          const year = yearString ? parseInt(yearString.trim()) : undefined;

          return {
            title: await bottomContainer.$eval("a", (el) => {
              const span = el.querySelector("span");
              span?.remove();
              return el.textContent?.trim() ?? "";
            }),
            year,
            link: await bottomContainer.$eval("a", (el) => el.href),
            imageUrl: await movie.$eval("img", (el) => el.src),
          };
        })
      );
    }) ?? []
  );
  // -------------------------------------------------------------

  browser.close();
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
};

export const scrapeYtsFilters = async () => {
  const { page, browser } = await createPuppeteer(ytsUrl);

  // ----------------------------- SCRAPE -----------------------------
  const selectContainers = await page.$$("div.selects-container");
  if (!selectContainers) return [];

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
  // -------------------------------------------------------------

  browser.close();
  return filters
    .filter((filter) => {
      const filterValues = Object.values(filter)[0] ?? [];
      return filter !== undefined && filterValues.every((value) => !!value);
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
};

export const scrapeYtsPagination = async (
  params: TYtsScrapperSearchParamsSchemas,
  pageNumber: number
) => {
  const url = getYtsUrl(params) + `?page=${pageNumber}`;

  const { page, browser } = await createPuppeteer(url);

  // ----------------------------- SCRAPE -----------------------------
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
        } catch {
          return null;
        }
      }) ?? []
    )
  ).filter(
    (number): number is string =>
      number !== null && typeof number === "string" && /^\d+$/.test(number)
  );
  // -------------------------------------------------------------

  browser.close();
  return Math.max(...paginationNumbers.map((number) => parseInt(number)), 1);
};

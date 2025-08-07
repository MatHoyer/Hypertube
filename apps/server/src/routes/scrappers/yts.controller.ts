import type { Context } from "hono";
import { YtsScrapper } from "../../lib/scrappers/yts.scrapper.js";

export const getYtsFilters = async (c: Context) => {
  const ytsScrapper = new YtsScrapper();
  await ytsScrapper.filterScrape();

  return c.json(ytsScrapper.searchParamsOptions);
};

export const postYtsFilters = async (c: Context) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.currentSearchParams = c.get("validatedBody");

  return c.json(await ytsScrapper.defaultScrape());
};

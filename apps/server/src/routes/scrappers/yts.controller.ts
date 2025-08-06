import type { Context } from "hono";
import { YtsScrapper } from "../../lib/scrapper/yts.scrapper.js";

const ytsScrapper = new YtsScrapper();

export const getYtsFilters = async (c: Context) => {
  const filters = await ytsScrapper.filterScrape();
  return c.json(ytsScrapper.searchParamsOptions);
};

export const postYtsFilters = async (c: Context) => {
  ytsScrapper.currentSearchParams = c.get("validatedBody");
  return c.json(await ytsScrapper.defaultScrape());
};

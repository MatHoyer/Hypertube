import type {
  TGetYtsPaginationSchemas,
  TPostYtsFiltersSchemas,
} from "@hypertube/libs";
import type { Context } from "hono";
import { YtsScrapper } from "../../lib/scrappers/yts.scrapper.js";
import type { TBodyParser } from "../../middlewares/bodyParser.js";
import type { TSearchParamsParser } from "../../middlewares/searchParamsParser.js";

export const getYtsFilters = async (c: Context) => {
  const ytsScrapper = new YtsScrapper();
  const searchParamsOptions = await ytsScrapper.filterScrape();

  return c.json(searchParamsOptions);
};

export const postYtsFilters = async (
  c: Context<TBodyParser<TPostYtsFiltersSchemas["requirements"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.currentSearchParams = c.get("validatedBody").filters;
  const movies = await ytsScrapper.defaultScrape();

  return c.json({
    movies,
  });
};

export const getYtsPagination = async (
  c: Context<TSearchParamsParser<TGetYtsPaginationSchemas["searchParams"]>>
) => {
  const ytsScrapper = new YtsScrapper();
  ytsScrapper.currentSearchParams = c.get("validatedSearchParams");
  const maxPagination = await ytsScrapper.paginationScrape();

  return c.json({
    maxPagination,
  });
};

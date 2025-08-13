export { test } from "./lib/test.js";

// Utils export
export { getUrl } from "./utils/getUrl.js";
export type {
  TApiRouteDataRequirements,
  TClientRouteDataRequirements,
} from "./utils/getUrl.js";
export { capitalize, capitalizeAllWords } from "./utils/string.utils.js";

// API Schemas export
export {
  getYtsDownloadMovieSchemas,
  getYtsFiltersSchemas,
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
  ytsScrapperSearchParamsSchemas,
} from "./schemas/api/yts.schema.js";
export type {
  TGetYtsDownloadMovieSchemas,
  TGetYtsFiltersSchemas,
  TGetYtsMovieDataSchemas,
  TGetYtsMoviesSchemas,
  TGetYtsPaginationSchemas,
  TYtsScrapperSearchParamsSchemas,
} from "./schemas/api/yts.schema.js";

// Database Schemas export
export {
  movieSchemas,
  resolutionSchemas,
  subtitleSchemas,
} from "./schemas/database/movie.schema.js";
export type {
  TMovieSchemas,
  TResolutionSchemas,
  TSubtitleSchemas,
} from "./schemas/database/movie.schema.js";

// Const export
export {
  ytsApiSortBy,
  ytsGenres,
  ytsQualities,
  ytsScrapperSortBy,
} from "./const/yts.const.js";

// Global const export
export { DownloadStates, languageCodes } from "./const/global.const.js";

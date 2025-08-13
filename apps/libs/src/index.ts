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
} from "./schemas/api/scrapper.schema.js";
export type {
  TGetYtsDownloadMovieSchemas,
  TGetYtsFiltersSchemas,
  TGetYtsMovieDataSchemas,
  TGetYtsMoviesSchemas,
  TGetYtsPaginationSchemas,
} from "./schemas/api/scrapper.schema.js";
export { testSchemas } from "./schemas/api/test.schema.js";
export type { TTestSchemas } from "./schemas/api/test.schema.js";

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
export { ytsGenres, ytsQualities, ytsSortBy } from "./const/yts.const.js";

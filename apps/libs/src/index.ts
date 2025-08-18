// Utils export
export { capitalize, capitalizeAllWords } from "./utils/string.utils.js";
export { getUrl } from "./utils/url/getUrl.js";
export { getServerUrl } from "./utils/url/getServerUrl.js";
export type {
  TApiRouteDataRequirements,
  TClientRouteDataRequirements,
} from "./utils/url/getUrl.js";
export { convertObjectToSearchParams } from "./utils/url/searchParams.js";

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
  actorSchema,
  movieSchema,
  movieWithResolutionsAndSubtitlesSchema,
  movieWithResolutionsSchema,
  movieWithSubtitlesSchema,
  resolutionSchema,
  subtitleSchema,
} from "./schemas/database/movie.schema.js";
export type {
  TMovieActorSchema,
  TMovieSchema,
  TMovieWithResolutionsAndSubtitlesSchema,
  TMovieWithResolutionsSchema,
  TMovieWithSubtitlesSchema,
  TResolutionSchema,
  TSubtitleSchema,
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

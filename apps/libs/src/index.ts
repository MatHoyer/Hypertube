// Utils export
export { newUTCDate } from "./utils/date.utils.js";
export { groupBy } from "./utils/object.utils.js";
export { capitalize, capitalizeAllWords } from "./utils/string.utils.js";
export { getServerUrl } from "./utils/url/getServerUrl.js";
export { getUrl } from "./utils/url/getUrl.js";
export type {
  TApiRouteDataRequirements,
  TClientRouteDataRequirements,
} from "./utils/url/getUrl.js";
export { convertObjectToSearchParams } from "./utils/url/searchParams.js";

// API Schemas export
export {
  deleteImageSchemas,
  getImageSchemas,
  postImageSchemas,
} from "./schemas/api/image.schema.js";
export type {
  TDeleteImageSchemas,
  TGetImageSchemas,
  TPostImageSchemas,
} from "./schemas/api/image.schema.js";

export {
  getMovieSchemas,
  getMoviesSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  tmdbMovieSchema,
} from "./schemas/api/movie.schema.js";
export type {
  TGetMovieSchemas,
  TGetMoviesSchemas,
  TPostMovieDownloadResolutionSchemas,
  TPostMovieDownloadSubtitlesSchemas,
} from "./schemas/api/movie.schema.js";
export {
  getYtsDownloadResolutionSchemas,
  getYtsDownloadSubtitlesSchemas,
  getYtsFiltersSchemas,
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
  getYtsStreamingResolutionSchemas,
  getYtsStreamingSubtitlesSchemas,
  ytsScrapperSearchParamsSchemas,
} from "./schemas/api/yts.schema.js";
export type {
  TGetYtsDownloadResolutionSchemas,
  TGetYtsDownloadSubtitlesSchemas,
  TGetYtsFiltersSchemas,
  TGetYtsMovieDataSchemas,
  TGetYtsMoviesSchemas,
  TGetYtsPaginationSchemas,
  TGetYtsStreamingResolutionSchemas,
  TGetYtsStreamingSubtitlesSchemas,
  TYtsScrapperSearchParamsSchemas,
} from "./schemas/api/yts.schema.js";

// Database Schemas export
export { imageSchema } from "./schemas/database/image.schema.js";
export type { TImageSchema } from "./schemas/database/image.schema.js";

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
export {
  DownloadStates,
  languageCodes,
  languageCodesArray,
  sizeMaxFile,
} from "./const/global.const.js";

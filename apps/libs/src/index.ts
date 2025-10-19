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
  postImageSchemas,
} from "./schemas/api/images.schema.js";
export type {
  TDeleteImageSchemas,
  TPostImageSchemas,
} from "./schemas/api/images.schema.js";

export { patchUsersSchemas } from "./schemas/api/users.schema.js";
export type { TPatchUsersSchemas } from "./schemas/api/users.schema.js";

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
  getStreamingResolutionSchemas,
  getStreamingSubtitlesSchemas,
} from "./schemas/api/streaming.schema.js";
export type {
  TGetStreamingResolutionSchemas,
  TGetStreamingSubtitlesSchemas,
} from "./schemas/api/streaming.schema.js";

export {
  postMovieDownloadJobEndedSchemas,
  postMovieDownloadJobStartedSchemas,
} from "./schemas/api/internal.schema.js";
export type {
  TPostMovieDownloadJobEndedSchemas,
  TPostMovieDownloadJobStartedSchemas,
} from "./schemas/api/internal.schema.js";

// Database Schemas export
export { imageSchema } from "./schemas/database/image.schema.js";
export type { TImageSchema } from "./schemas/database/image.schema.js";

export { userSchema } from "./schemas/database/user.schema.js";
export type { TUserSchema } from "./schemas/database/user.schema.js";

export {
  movieSchema,
  resolutionSchema,
  subtitleSchema,
} from "./schemas/database/movie.schema.js";
export type {
  TMovieSchema,
  TResolutionSchema,
  TSubtitleSchema,
} from "./schemas/database/movie.schema.js";

// Logger export
export { hypertubeLogger } from "./utils/logger.js";

// Const export
export {
  ytsApiSortBy,
  ytsGenres,
  ytsQualities,
  ytsScrapperSortBy,
} from "./const/yts.const.js";

export {
  DownloadStates,
  languageCodes,
  languageCodesArray,
  Providers,
  sizeMaxFile,
} from "./const/global.const.js";

export { enZod } from "./utils/i18n/enZod.js";
export { esZod } from "./utils/i18n/esZod.js";
export { frZod } from "./utils/i18n/frZod.js";
export { zodTranslate } from "./utils/i18n/zodTranslate.js";

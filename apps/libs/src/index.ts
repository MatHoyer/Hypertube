export { test } from "./lib/test.js";

// Utils export
export { getUrl } from "./utils/getUrl.js";
export type {
  TApiRouteDataRequirements,
  TClientRouteDataRequirements,
} from "./utils/getUrl.js";

// API Schemas export
export {
  getYtsFiltersSchemas,
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
  ytsMovieDataSchemas,
} from "./schemas/api/scrapper.schema.js";
export type {
  TGetYtsFiltersSchemas,
  TGetYtsMovieDataSchemas,
  TGetYtsMoviesSchemas,
  TGetYtsPaginationSchemas,
  TYtsMovieDataSchemas,
} from "./schemas/api/scrapper.schema.js";
export { testSchemas } from "./schemas/api/test.schema.js";
export type { TTestSchemas } from "./schemas/api/test.schema.js";

// Database Schemas export
export {
  movieSchemas,
  tmpMovieSchemas,
} from "./schemas/database/movie.schema.js";
export type {
  TMovieSchemas,
  TTmpMovieSchemas,
} from "./schemas/database/movie.schema.js";

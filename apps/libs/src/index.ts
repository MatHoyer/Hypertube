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
  getYtsPaginationSchemas,
  postYtsFiltersSchemas,
  ytsMovieSchemas,
} from "./schemas/api/scrapper.schema.js";
export type {
  TGetYtsFiltersSchemas,
  TGetYtsPaginationSchemas,
  TPostYtsFiltersSchemas,
  TYtsMovieSchemas,
} from "./schemas/api/scrapper.schema.js";
export { testSchemas } from "./schemas/api/test.schema.js";
export type { TTestSchemas } from "./schemas/api/test.schema.js";

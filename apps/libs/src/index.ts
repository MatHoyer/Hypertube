// Utils export
export {
  getDateAsString,
  getNearDate,
  newUTCDate,
} from "./utils/date.utils.js";
export type {
  TDateFormatsKeys,
  TDateFormatsParams,
} from "./utils/date.utils.js";
export { groupBy, pick } from "./utils/object.utils.js";
export { capitalize, capitalizeAllWords } from "./utils/string.utils.js";
export { getClientUrl } from "./utils/url/getClientUrl.js";
export { getServerUrl } from "./utils/url/getServerUrl.js";
export { getUrl, ROUTES } from "./utils/url/getUrl.js";
export type {
  TAPIRoute,
  TClientRoute,
  TExternalRoute,
} from "./utils/url/getUrl.js";
export { convertObjectToSearchParams } from "./utils/url/searchParams.js";

// API Schemas export

export {
  emailVerificationAuthentificationSchemas,
  linkProviderAuthentificationSchemas,
  requestPasswordResetAuthentificationSchemas,
  resetPasswordAuthentificationSchemas,
  signInAuthentificationSchemas,
  signInSocialAuthentificationSchemas,
  signOutAuthentificationSchemas,
  signUpAuthentificationSchemas,
  unlinkProviderAuthentificationSchemas,
} from "./schemas/api/authentification.schema.js";
export type {
  TEmailVerificationAuthentificationSchemas,
  TLinkProviderAuthentificationSchemas,
  TRequestPasswordResetAuthentificationSchemas,
  TResetPasswordAuthentificationSchemas,
  TSignInAuthentificationSchemas,
  TSignInSocialAuthentificationSchemas,
  TSignOutAuthentificationSchemas,
  TSignUpAuthentificationSchemas,
  TUnlinkProviderAuthentificationSchemas,
} from "./schemas/api/authentification.schema.js";

export {
  getAccountsUsersSchemas,
  getSessionUsersSchemas,
  patchUsersSchemas,
} from "./schemas/api/users.schema.js";
export type {
  TGetAccountsUsersSchemas,
  TGetSessionUsersSchemas,
  TPatchUsersSchemas,
} from "./schemas/api/users.schema.js";

export {
  deleteImageSchemas,
  postImageSchemas,
} from "./schemas/api/images.schema.js";
export type {
  TDeleteImageSchemas,
  TPostImageSchemas,
} from "./schemas/api/images.schema.js";

export {
  deleteMovieSubscribeSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getMovieSSESchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  postMovieSubscribeSchemas,
  tmdbMovieSchema,
} from "./schemas/api/movie.schema.js";
export type {
  TDeleteMovieSubscribeSchemas,
  TGetMovieSchemas,
  TGetMoviesSchemas,
  TGetMovieSSESchemas,
  TPostMovieDownloadResolutionSchemas,
  TPostMovieDownloadSubtitlesSchemas,
  TPostMovieSubscribeSchemas,
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
  getNotificationsSchemas,
  getNotificationsSSESchemas,
  getNotificationsStatsSchemas,
  patchNotificationSchemas,
  patchNotificationsSchemas,
  postSendTestNotificationSchemas,
} from "./schemas/api/notifications.schema.js";
export type {
  TGetNotificationsSchemas,
  TGetNotificationsSSESchemas,
  TGetNotificationsStatsSchemas,
  TPatchNotificationSchemas,
  TPatchNotificationsSchemas,
  TPostSendTestNotificationSchemas,
} from "./schemas/api/notifications.schema.js";

export {
  deleteCredentialsSchemas,
  getCredentialsSchemas,
  postCredentialsSchemas,
  postTokenSchemas,
} from "./schemas/api/oauth.schema.js";
export type {
  TDeleteCredentialsSchemas,
  TGetCredentialsSchemas,
  TPostCredentialsSchemas,
  TPostTokenSchemas,
} from "./schemas/api/oauth.schema.js";

// Database Schemas export
export { imageSchema } from "./schemas/database/image.schema.js";
export type { TImageSchema } from "./schemas/database/image.schema.js";

export { credentialSchema } from "./schemas/database/credential.schema.js";
export type { TCredentialSchema } from "./schemas/database/credential.schema.js";

export { userSchema } from "./schemas/database/user.schema.js";
export type { TUserSchema } from "./schemas/database/user.schema.js";

export { sessionSchema } from "./schemas/database/session.schema.js";
export type { TSessionSchema } from "./schemas/database/session.schema.js";

export { accountsSchema } from "./schemas/database/accounts.schema.js";
export type { TAccountsSchema } from "./schemas/database/accounts.schema.js";

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

export { notificationSchema } from "./schemas/database/notifications.schema.js";
export type { TNotificationSchema } from "./schemas/database/notifications.schema.js";

// Logger export
export { hypertubeLogger, LOG_LEVELS, specificLogger } from "./utils/logger.js";
export type { TLogger, TLogLevel } from "./utils/logger.js";

// Const export
export {
  ytsApiSortBy,
  ytsGenres,
  ytsQualities,
  ytsScrapperSortBy,
} from "./const/yts.const.js";

export {
  betterAuthProviders,
  DownloadStates,
  languageCodes,
  languageCodesArray,
  notificationReadStatusArray,
  notificationReadStatuses,
  Providers,
  sizeMaxFile,
} from "./const/global.const.js";
export type {
  DownloadState,
  LanguageCode,
  NotificationReadStatus,
} from "./const/global.const.js";

export type { TBetterAuthProviders } from "./const/global.const.js";

export { notifications } from "./const/notifications.const.js";
export type { TNotification } from "./const/notifications.const.js";

export { enZod } from "./utils/i18n/enZod.js";
export { esZod } from "./utils/i18n/esZod.js";
export { frZod } from "./utils/i18n/frZod.js";
export { zodTranslate } from "./utils/i18n/zodTranslate.js";

export { MOVIE_EVENTS, NOTIFICATIONS_EVENTS } from "./const/events.js";
export type { TMovieEvents, TNotificationsEvents } from "./const/events.js";

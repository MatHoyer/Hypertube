import type { TFunction } from "i18next";

const keyErrorCodes = [
  "INVALID_USERNAME_OR_PASSWORD",
  "EMAIL_NOT_VERIFIED",
  "UNEXPECTED_ERROR",
  "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER",
  "USERNAME_IS_TOO_SHORT",
  "USERNAME_IS_TOO_LONG",
  "USERNAME_IS_INVALID",
  "DISPLAY_USERNAME_IS_INVALID",
  "USER_NOT_FOUND",
  "FAILED_TO_CREATE_USER",
  "FAILED_TO_CREATE_SESSION",
  "FAILED_TO_UPDATE_USER",
  "FAILED_TO_GET_SESSION",
  "INVALID_PASSWORD",
  "INVALID_EMAIL",
  "INVALID_EMAIL_OR_PASSWORD",
  "SOCIAL_ACCOUNT_ALREADY_LINKED",
  "PROVIDER_NOT_FOUND",
  "INVALID_TOKEN",
  "ID_TOKEN_NOT_SUPPORTED",
  "FAILED_TO_GET_USER_INFO",
  "USER_EMAIL_NOT_FOUND",
  "PASSWORD_TOO_SHORT",
  "PASSWORD_TOO_LONG",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
  "EMAIL_CAN_NOT_BE_UPDATED",
  "CREDENTIAL_ACCOUNT_NOT_FOUND",
  "SESSION_EXPIRED_REAUTHENTICATE_TO_PERFORM_THIS_ACTION",
  "YOU_CANT_UNLINK_YOUR_LAST_ACCOUNT",
  "ACCOUNT_NOT_FOUND",
  "USER_ALREADY_HAS_A_PASSWORD_PROVIDE_THAT_TO_DELETE_THE_ACCOUNT",
  "PASSWORD_POLICY",
  "EMAIL_IS_THE_SAME",
  "COULDNT_UPDATE_YOUR_EMAIL",
  "FAILED_TO_UPDATE_PASSWORD",
  "ACCOUNT_ALREADY_LINKED_TO_DIFFERENT_USER",
] as const;

export const errorCodes = keyErrorCodes.map(
  (code) => `better-auth-error.${code}` as const
);

export const betterAuthTranslation = (
  t: TFunction,
  code: string | undefined
): string => {
  try {
    if (
      !errorCodes.includes(
        `better-auth-error.${code as (typeof keyErrorCodes)[number]}`
      )
    ) {
      console.log("better-auth error code : ", code);
      return t("global.unexpected-error");
    }
    return t(`better-auth-error.${code}` as (typeof errorCodes)[number]);
  } catch {
    return t("global.unexpected-error");
  }
};

export const supportedOAuth = {
  google: { name: "Google", img: "/images/oauth_logo/google_logo.png" },
  github: { name: "Github", img: "/images/oauth_logo/github_logo.svg" },
  discord: { name: "Discord", img: "/images/oauth_logo/discord_logo.webp" },
  school42: { name: "42 School", img: "/images/oauth_logo/42_logo.png" },
} as const;
export type TSupportedOAuth = keyof typeof supportedOAuth;

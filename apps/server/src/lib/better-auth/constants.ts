import { hypertubeLogger } from "@hypertube/libs";
import { Status } from "better-auth";
import { APIError, isAPIError } from "better-auth/api";
import { Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import i18next from "i18next";

const keyErrorCodes = [
  "INVALID_USERNAME_OR_PASSWORD",
  "EMAIL_NOT_VERIFIED",
  "UNEXPECTED_ERROR",
  "USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER",
  "USERNAME_IS_ALREADY_TAKEN",
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
  "USER_ALREADY_HAS_A_PASSWORD",
  "TOO_MANY_EMAILS_SENT",
  "OAUTH_CODE_VERIFICATION_FAILED",
  "EMAIL_DOESN'T_MATCH",
  "FAILED_TO_UNLINK_LAST_ACCOUNT",
] as const;

export const errorCodes = keyErrorCodes.map(
  (code) => `betterAuthError.${code}` as const
);

const getApiErrorCodes = (
  error: unknown
): { errorCode: string | undefined; statusCode: number } => {
  if (!isAPIError(error)) return { errorCode: undefined, statusCode: 400 };
  return { errorCode: error.body?.code, statusCode: error.statusCode };
};

export const betterAuthErrorTranslation = (
  error: unknown
): { message: string; statusCode: ContentfulStatusCode } => {
  let code = "UNEXPECTED_ERROR";
  try {
    const { errorCode, statusCode } = getApiErrorCodes(error);
    if (errorCode) code = errorCode;

    if (
      !errorCodes.includes(
        `betterAuthError.${code as (typeof keyErrorCodes)[number]}`
      )
    ) {
      hypertubeLogger.warn(`better-auth error code not translate : ${code}`);
      return {
        message: i18next.t("betterAuthError.UNEXPECTED_ERROR"),
        statusCode: statusCode as ContentfulStatusCode,
      };
    }

    return {
      message: i18next.t(
        `betterAuthError.${code}` as (typeof errorCodes)[number]
      ),
      statusCode: statusCode as ContentfulStatusCode,
    };
  } catch {
    return {
      message: i18next.t("betterAuthError.UNEXPECTED_ERROR"),
      statusCode: 400,
    };
  }
};

export const handleAuthentificationMethod = async (
  c: Context,
  fn: () => Promise<Response | void>,
  successMessage: string
) => {
  try {
    const res = await fn();
    if (!(res instanceof Response)) {
      return c.json({ message: successMessage }, 200);
    }

    const responseData = await res.json();
    if (!res.ok) {
      throw new APIError(res.status as Status, {
        code: responseData.code,
      });
    }

    const body = {
      ...responseData,
      message: successMessage,
    };

    return new Response(JSON.stringify(body), res);
  } catch (e) {
    const { message, statusCode } = betterAuthErrorTranslation(e);

    return c.json({ message }, statusCode);
  }
};

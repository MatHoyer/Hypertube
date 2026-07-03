// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { TFunction } from "i18next";
import z from "zod";
import { hypertubeLogger } from "../logger.js";

/**
 * Translate zod errors to the language of the user
 *
 * For zod refine custom error: .refine(..., { path: ["example_error"] })
 *
 * Keys per type (type: eg. "string", "number", "boolean", "date", "array", "object", ...):
 * "invalid_type"
 * "custom"
 * "too_big"
 * "too_small"
 * "invalid_format"
 * "not_multiple_of"
 * "unrecognized_keys"
 * "invalid_union"
 * "invalid_key"
 * "invalid_element"
 * "invalid_value"
 */

export const zodTranslate = (t: TFunction) => {
  z.config({
    customError: (issue) => {
      hypertubeLogger.debug(`zod issue : ${JSON.stringify(issue)}`);
      let errorKey = `zod.${issue.origin ?? issue.expected}.${issue.code}`;

      if (issue.code === "custom") {
        const customCode = issue.path?.pop();
        errorKey = `zod.${issue.code}.${customCode.toString()}`;
      }

      switch (issue.code) {
        case "invalid_type":
        case "custom":
          return t(errorKey);
        case "invalid_format":
          return t(errorKey, { format: issue.format });
        case "too_big":
          return t(errorKey, {
            maximum: issue.maximum,
          });
        case "too_small":
          return t(errorKey, {
            minimum: issue.minimum,
          });
        default:
          return t("zod.unknown");
      }
    },
  });
};

// @ts-nocheck
import type { TFunction } from "i18next";
import z from "zod";

/**
 * Translate zod errors to the language of the user
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
      console.log(issue);
      const errorKey = `zod.${issue.origin ?? issue.expected}.${issue.code}`;
      switch (issue.code) {
        case "invalid_type":
          return t(errorKey);
        case "too_big":
          return t(errorKey, {
            maximum: issue.maximum,
          });
        case "too_small":
          return t(errorKey, {
            minimum: issue.minimum,
          });
        default:
          return t(errorKey);
      }
    },
  });
};

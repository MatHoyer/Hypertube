import type { TFunction } from "i18next";
import z from "zod";

/**
 * Translate zod errors to the language of the user
 * The i18n config needs to contains all keys in the i18n files (zod.[...error]))
 */

export const zodTranslate = (t: TFunction) => {
  z.config({
    customError: (issue) => t(`zod.${issue.code}`),
  });
};

/**
 * Keys:
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

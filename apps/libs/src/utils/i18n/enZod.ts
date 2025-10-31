export const enZod = {
  zod: {
    string: {
      invalid_type: "expected string",
      invalid_format: "expected {{format}}",
      too_big: "too big, maximum length is {{maximum}}",
      too_small: "too small, minimum length is {{minimum}}",
    },
    number: {
      invalid_type: "expected number",
      too_big: "too big, maximum value is {{maximum}}",
      too_small: "too small, minimum value is {{minimum}}",
    },
    boolean: {
      invalid_type: "expected boolean",
    },
    date: {
      invalid_type: "expected date",
      too_big: "too big, maximum value is {{maximum}}",
      too_small: "too small, minimum value is {{minimum}}",
    },
    array: {
      invalid_type: "expected array",
      too_big: "too big, maximum length is {{maximum}}",
      too_small: "too small, minimum length is {{minimum}}",
    },
    object: {
      invalid_type: "expected object",
    },
    custom: {
      passwordOldNeedNew: "The old password needs the new password",
    },
    unknown: "Unknown error",
  },
};

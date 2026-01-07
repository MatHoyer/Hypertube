export const esZod = {
  zod: {
    string: {
      invalid_type: "se esperaba una cadena",
      invalid_format: "se esperaba {{format}}",
      too_big: "demasiado grande, la longitud máxima es {{maximum}}",
      too_small: "demasiado pequeño, la longitud mínima es {{minimum}}",
    },
    number: {
      invalid_type: "se esperaba un número",
      too_big: "demasiado grande, el valor máximo es {{maximum}}",
      too_small: "demasiado pequeño, el valor mínimo es {{minimum}}",
    },
    boolean: {
      invalid_type: "se esperaba un booleano",
    },
    date: {
      invalid_type: "se esperaba una fecha",
      too_big: "demasiado grande, el valor máximo es {{maximum}}",
      too_small: "demasiado pequeño, el valor mínimo es {{minimum}}",
    },
    array: {
      invalid_type: "se esperaba un array",
      too_big: "demasiado grande, la longitud máxima es {{maximum}}",
      too_small: "demasiado pequeño, la longitud mínima es {{minimum}}",
    },
    object: {
      invalid_type: "se esperaba un objeto",
    },
    custom: {
      passwordOldNeedNew: "La contraseña antigua necesita la nueva contraseña",
    },
    unknown: "Error desconocido",
  },
};

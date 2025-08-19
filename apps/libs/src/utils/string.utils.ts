export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeAllWords = (str: string, separator: string = " ") => {
  return str.split(separator).map(capitalize).join(separator);
};

export const isInt = (str: string) => {
  return str.split("").every((char) => char >= "0" && char <= "9");
};

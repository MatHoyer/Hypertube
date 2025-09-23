import z from "zod";

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const capitalizeAllWords = (str: string, separator: string = " ") =>
  str.split(separator).map(capitalize).join(separator);

export const isUrl = (url: string | null | undefined) =>
  z.url().safeParse(url).success;

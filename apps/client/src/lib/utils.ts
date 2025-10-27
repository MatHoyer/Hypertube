import type { LanguageCode, TDateFormatsParams } from "@hypertube/libs";
import { getDateAsString, getNearDate } from "@hypertube/libs";
import { clsx, type ClassValue } from "clsx";
import i18next from "i18next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDateAsStringWithLocale = ({
  date,
  type,
  separator,
}: Omit<TDateFormatsParams, "locale">) => {
  return getDateAsString({
    date,
    type,
    locale: i18next.language as LanguageCode,
    separator,
  } as TDateFormatsParams);
};

export const getNearDateWithLocale = ({
  date,
  options,
}: {
  date: Date;
  options?: { includeSeconds?: boolean; addSuffix?: boolean };
}) => {
  return getNearDate(date, i18next.language as LanguageCode, options);
};

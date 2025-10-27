import { TZDate } from "@date-fns/tz";
import type { Locale } from "date-fns";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import type { LanguageCode } from "../const/global.const.js";

export const newUTCDate = (date: Date = new Date()) => {
  return new TZDate(date, "UTC");
};

export const DateFormats = {
  DAY: "dd",
  DAY_IN_LETTER: "EEEE",
  MONTH: "MM",
  MONTH_IN_LETTER: "MMMM",
  YEAR: "yyyy",
  HOUR: "HH",
  MINUTE: "mm",
  SECOND: "ss",

  SHORT: "LLL dd, y",

  get FULL() {
    return `${this.DAY_IN_LETTER} ${this.DAY} ${this.MONTH_IN_LETTER} ${this.YEAR} ${this.HOUR}:${this.MINUTE}:${this.SECOND}`;
  },
  get LONG_DATE_WITH_HOUR() {
    return `${this.DAY_IN_LETTER} ${this.DAY} ${this.MONTH_IN_LETTER} ${this.YEAR} à ${this.HOUR}:${this.MINUTE}`;
  },
  get SHORT_DATE_WITH_HOUR() {
    return `${this.DAY}/${this.MONTH}/${this.YEAR} à ${this.HOUR}:${this.MINUTE}`;
  },
};

export type TDateFormatsKeys = keyof typeof DateFormats;
export type TDateFormatsParams = {
  date: Date;
  locale: LanguageCode;
} & (
  | {
      type: TDateFormatsKeys;
      separator?: never;
    }
  | {
      type: TDateFormatsKeys[];
      separator?: string;
    }
);

const dateFnsLocales: Record<LanguageCode, Locale> = {
  en: enUS,
  fr: fr,
  es: es,
};

export const getDateAsString = ({
  date,
  type,
  locale,
  separator,
}: TDateFormatsParams) => {
  if (Array.isArray(type)) {
    return type
      .map((t) =>
        format(date, DateFormats[t], { locale: dateFnsLocales[locale] })
      )
      .join(separator || " ");
  }
  return format(date, DateFormats[type], { locale: dateFnsLocales[locale] });
};

export const getNearDate = (
  date: Date,
  locale: LanguageCode,
  options?: { includeSeconds?: boolean; addSuffix?: boolean }
) => {
  return formatDistanceToNow(date, {
    locale: dateFnsLocales[locale],
    addSuffix: options?.addSuffix ?? true,
    includeSeconds: options?.includeSeconds ?? true,
  });
};

import { TZDate } from "@date-fns/tz";

export const newUTCDate = (date: Date = new Date()) => {
  return new TZDate(date, "UTC");
};

import { StatTypes } from "@hypertube/libs";

export const StatColors = {
  [StatTypes.LIKES]: "var(--color-red-500)",
  [StatTypes.COMMENTS]: "var(--color-blue-500)",
} as const;

export const StatBackgroundColors = {
  [StatTypes.LIKES]: "bg-red-500/10",
  [StatTypes.COMMENTS]: "bg-blue-500/10",
} as const;

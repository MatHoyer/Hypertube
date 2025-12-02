import type { TStatType } from "@hypertube/libs";
import type { LucideProps } from "lucide-react";
import { StatColors } from "./profile-stats.colors";
import { StatIcons } from "./profile-stats.icons";

export const getProfileStatIcon = (
  statType: TStatType,
  props?: Omit<LucideProps, "color">
) => {
  return StatIcons[statType]({
    color: StatColors[statType],
    ...props,
  });
};

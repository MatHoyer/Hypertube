import { StatTypes } from "@hypertube/libs";
import { MessageSquare, ThumbsUp } from "lucide-react";
import type { ComponentProps } from "react";

export const StatIcons = {
  [StatTypes.LIKES]: (props: ComponentProps<typeof ThumbsUp>) => (
    <ThumbsUp {...props} />
  ),
  [StatTypes.COMMENTS]: (props: ComponentProps<typeof MessageSquare>) => (
    <MessageSquare {...props} />
  ),
} as const;

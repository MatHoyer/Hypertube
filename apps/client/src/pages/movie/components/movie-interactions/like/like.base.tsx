import { LoadingButton } from "@/components/LoadingButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ParentTypes, type TParentType } from "@hypertube/libs";
import { t } from "i18next";
import { ThumbsUp } from "lucide-react";

export const BaseLikeButton: React.FC<{
  disabled?: boolean;
  isLiked: boolean;
  likesNumber?: number;
  onToggle: () => void;
  likeType: TParentType;
  isPending: boolean;
  isSuccess: boolean;
}> = ({
  disabled,
  isLiked,
  likesNumber,
  onToggle,
  likeType,
  isPending,
  isSuccess,
}) => {
  const tooltipText = () => {
    if (likeType === ParentTypes.MOVIE) {
      return isLiked
        ? t("movie.likes.tooltip.unlikeMovie")
        : t("movie.likes.tooltip.likeMovie");
    } else {
      return isLiked
        ? t("movie.comments.likes.unlikeComment")
        : t("movie.comments.likes.likeComment");
    }
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <LoadingButton
            disabled={disabled}
            variant="ghost"
            onClick={onToggle}
            loading={isPending}
            success={isSuccess}
          >
            <ThumbsUp
              className={cn(
                "transition-colors",
                isLiked && "fill-primary text-primary"
              )}
            />
            {likesNumber}
          </LoadingButton>
        </TooltipTrigger>
        <TooltipContent>{tooltipText()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

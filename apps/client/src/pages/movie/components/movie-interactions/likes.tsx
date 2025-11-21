import { LoadingButton } from "@/components/LoadingButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  deleteCommentLikeSchemas,
  deleteMovieLikeSchemas,
  getUrl,
  ParentTypes,
  postCommentLikeSchemas,
  postMovieLikeSchemas,
  ROUTES,
  type TMovieSchema,
  type TParentType,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import { ThumbsUp } from "lucide-react";
import { getParentQueryKey, type TQueryParent } from "./utils";

export const BaseLikeButton: React.FC<{
  isLiked: boolean;
  likesNumber?: number;
  onToggle: () => void;
  likeType: TParentType;
  isPending: boolean;
  isSuccess: boolean;
}> = ({ isLiked, likesNumber, onToggle, likeType, isPending, isSuccess }) => {
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
            variant="ghost"
            onClick={onToggle}
            loading={isPending}
            success={isSuccess}
          >
            <ThumbsUp
              className={cn(
                "transition-colors",
                isLiked ? "text-primary fill-primary" : "text-gray-500"
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

export const MovieLikeButton: React.FC<{
  tmdbId: TMovieSchema["tmdbId"];
  isLiked: boolean;
  likesNumber: number;
}> = ({ tmdbId, isLiked, likesNumber }) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isLiked ? "DELETE" : "POST",
        url: getUrl(ROUTES.API.MOVIES_LIKE, { tmdbId }),
        schemas: isLiked ? deleteMovieLikeSchemas : postMovieLikeSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES, { tmdbId }),
      });
    },
  });

  return (
    <BaseLikeButton
      isLiked={isLiked}
      likesNumber={likesNumber}
      onToggle={mutate}
      likeType={ParentTypes.MOVIE}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

export const CommentLikeButton: React.FC<{
  commentId: TCommentSchema["id"];
  isLiked: boolean;
  likesNumber: number;
  parent: TQueryParent;
}> = ({ commentId, isLiked, likesNumber, parent }) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isLiked ? "DELETE" : "POST",
        url: getUrl(ROUTES.API.COMMENTS_LIKES, { commentId }),
        schemas: isLiked ? deleteCommentLikeSchemas : postCommentLikeSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getParentQueryKey(parent) });
    },
  });

  return (
    <BaseLikeButton
      isLiked={isLiked}
      likesNumber={likesNumber}
      onToggle={() => mutate()}
      likeType={ParentTypes.COMMENT}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

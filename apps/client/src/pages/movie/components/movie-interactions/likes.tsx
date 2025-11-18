import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import {
  deleteCommentLikeSchemas,
  deleteMovieLikeSchemas,
  getUrl,
  ParentTypes,
  postCommentLikeSchemas,
  postMovieLikeSchemas,
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
}> = ({ isLiked, likesNumber, onToggle, likeType }) => {
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
          <Button variant="ghost" onClick={onToggle}>
            <ThumbsUp
              className={`transition-colors ${
                isLiked ? "text-primary fill-primary" : "text-gray-500"
              }`}
            />
            {likesNumber}
          </Button>
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

  const { mutate } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isLiked ? "DELETE" : "POST",
        url: getUrl("api-movies-like", { tmdbId }),
        schemas: isLiked ? deleteMovieLikeSchemas : postMovieLikeSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", tmdbId] });
    },
  });

  return (
    <BaseLikeButton
      isLiked={isLiked}
      likesNumber={likesNumber}
      onToggle={() => mutate()}
      likeType={ParentTypes.MOVIE}
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

  const { mutate } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isLiked ? "DELETE" : "POST",
        url: getUrl("api-comments-like", { commentId }),
        schemas: isLiked ? deleteCommentLikeSchemas : postCommentLikeSchemas,
      }),
    onSuccess: () => {
      console.log("invalidating query key", getParentQueryKey(parent));
      queryClient.invalidateQueries({ queryKey: getParentQueryKey(parent) });
    },
  });

  return (
    <BaseLikeButton
      isLiked={isLiked}
      likesNumber={likesNumber}
      onToggle={() => mutate()}
      likeType={parent.type}
    />
  );
};

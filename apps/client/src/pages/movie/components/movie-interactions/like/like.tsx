import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteCommentLikeSchemas,
  deleteMovieLikeSchemas,
  getUrl,
  ParentTypes,
  postCommentLikeSchemas,
  postMovieLikeSchemas,
  ROUTES,
  type TMovieSchema,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getParentQueryKey, type TQueryParent } from "../utils";
import { BaseLikeButton } from "./like.base";

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

import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  getUrl,
  postCommentReplySchemas,
  postMovieCommentSchemas,
  ROUTES,
  type TMovieSchema,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BasePostComment } from "./base.post.comment";

export const PostMovieComment: React.FC<{ tmdbId: TMovieSchema["tmdbId"] }> = ({
  tmdbId,
}) => {
  const queryClient = useQueryClient();

  const {
    mutate: postComment,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.MOVIES_COMMENT, { tmdbId }),
        data: { content },
        schemas: postMovieCommentSchemas,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_COMMENT, { tmdbId }),
      }),
  });

  return (
    <BasePostComment
      postComment={postComment}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
};

export const PostReplyComment: React.FC<{
  commentId: TCommentSchema["id"];
  setIsReplying: (value: boolean) => void;
}> = ({ commentId, setIsReplying }) => {
  const queryClient = useQueryClient();

  const {
    mutate: postReply,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.COMMENTS_REPLIES, { commentId }),
        data: { content },
        schemas: postCommentReplySchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.COMMENTS_REPLIES, { commentId }),
      });
      setIsReplying(false);
    },
  });

  return (
    <BasePostComment
      postComment={postReply}
      isPending={isPending}
      isSuccess={isSuccess}
      autoFocus
    />
  );
};

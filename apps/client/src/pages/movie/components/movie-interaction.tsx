import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteCommentSchemas,
  deleteMovieLikeSchemas,
  deleteMovieSubscribeSchemas,
  getMovieCommentSchemas,
  getUrl,
  patchCommentSchemas,
  postMovieCommentSchemas,
  postMovieLikeSchemas,
  postMovieSubscribeSchemas,
  ROUTES,
  type TGetMovieSchemas,
  type TMovieSchema,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { t } from "i18next";
import { ThumbsUp } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const SubscriptionButton: React.FC<{
  tmdbId: TMovieSchema["tmdbId"];
  isSubscribed: boolean;
}> = ({ tmdbId, isSubscribed }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: toggleSubscription } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isSubscribed ? "DELETE" : "POST",
        url: getUrl(ROUTES.API.MOVIES_SUBSCRIPTION, { tmdbId }),
        schemas: isSubscribed
          ? deleteMovieSubscribeSchemas
          : postMovieSubscribeSchemas,
      }),
    onSuccess: () => {
      toast.success(
        isSubscribed
          ? t("movie.subscriptions.toast.unsubscribe")
          : t("movie.subscriptions.toast.subscribe")
      );
      queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES, { tmdbId }),
      });
    },
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => toggleSubscription()}>
            {isSubscribed
              ? t("movie.subscriptions.unsubscribe")
              : t("movie.subscriptions.subscribe")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSubscribed
            ? t("movie.subscriptions.tooltip.unsubscribe")
            : t("movie.subscriptions.tooltip.subscribe")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LikeButton: React.FC<{
  tmdbId: TMovieSchema["tmdbId"];
  isLiked: boolean;
}> = ({ tmdbId, isLiked }) => {
  const queryClient = useQueryClient();

  const { mutate: toggleLike } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isLiked ? "DELETE" : "POST",
        url: getUrl("api-movies-like", { tmdbId }),
        schemas: isLiked ? deleteMovieLikeSchemas : postMovieLikeSchemas,
      }),
    onSuccess: () => {
      toast.success(
        isLiked ? t("movie.likes.unlikeMovie") : t("movie.likes.likeMovie")
      );
      queryClient.invalidateQueries({ queryKey: ["movie", tmdbId] });
    },
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" onClick={() => toggleLike()}>
            <ThumbsUp
              className={`transition-colors ${
                isLiked ? "text-primary fill-primary" : "text-gray-500"
              }`}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isLiked
            ? t("movie.likes.tooltip.unlikeMovie")
            : t("movie.likes.tooltip.likeMovie")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const PostComment: React.FC<{ tmdbId: TMovieSchema["tmdbId"] }> = ({
  tmdbId,
}) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const { mutate: postComment } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "POST",
        url: getUrl("api-movies-comment", { tmdbId: tmdbId }),
        data: { content },
        schemas: postMovieCommentSchemas,
      }),
    onSuccess: () => {
      toast.success("Comment posted");
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["movie-comments", tmdbId] });
    },
    onError: () => {
      toast.error("Error when posting comment");
    },
  });
  return (
    <InputGroup>
      <InputGroupInput
        placeholder={t("movie.comments.addComment")}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && newComment) {
            postComment(newComment);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Button onClick={() => postComment(newComment)}>
          {t("movie.comments.sendComment")}
        </Button>
      </InputGroupAddon>{" "}
    </InputGroup>
  );
};

const DeleteCommentButton: React.FC<{
  commentId: TCommentSchema["id"];
  tmdbId: TMovieSchema["tmdbId"];
}> = ({ commentId, tmdbId }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: deleteComment, isPending } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "DELETE",
        url: getUrl("api-comments", { commentId }),
        schemas: deleteCommentSchemas,
      }),
    onSuccess: () => {
      toast.success(t("movie.comments.toast.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["movie-comments", tmdbId] });
    },
    onError: () => {
      toast.error(t("movie.comments.toast.deleteError"));
    },
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => deleteComment()} disabled={isPending}>
            {t("movie.comments.deleteComment")}
          </Button>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};

const EditCommentButton: React.FC<{
  commentId: TCommentSchema["id"];
  tmdbId: TMovieSchema["tmdbId"];
  initialContent: TCommentSchema["content"];
}> = ({ commentId, tmdbId, initialContent }) => {
  const queryClient = useQueryClient();
  const [editedContent, setEditedContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: patchComment, isPending } = useMutation({
    mutationFn: (content: string) =>
      axiosFetch({
        method: "PATCH",
        url: getUrl("api-comments", { commentId }),
        data: { content },
        schemas: patchCommentSchemas,
      }),
    onSuccess: () => {
      toast.success("Comment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["movie-comments", tmdbId] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Comment updating error");
    },
  });

  if (!isEditing) {
    return <Button onClick={() => setIsEditing(true)}>Edit</Button>;
  }

  const handleCancel = () => {
    setEditedContent(initialContent);
    setIsEditing(false);
  };

  return (
    <InputGroup>
      <InputGroupInput
        placeholder={t("movie.comments.addComment")}
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && editedContent) {
            patchComment(editedContent);
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        disabled={isPending}
      />
      <InputGroupAddon align="inline-end">
        <Button
          disabled={isPending}
          onClick={() => patchComment(editedContent)}
        >
          {"modifier"}
        </Button>
      </InputGroupAddon>{" "}
    </InputGroup>
  );
};

export const MovieInteraction = ({
  movie,
}: {
  movie: TGetMovieSchemas["response"];
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: _,
  } = useInfiniteQuery({
    queryKey: ["movie-comments", movie.tmdbId],
    queryFn: async ({ pageParam }) =>
      axiosFetch({
        method: "GET",
        url: getUrl(ROUTES.API.MOVIES_COMMENT, {
          tmdbId: movie.tmdbId,
          searchParams: { page: pageParam.toString(), pageSize: "10" },
        }),
        schemas: getMovieCommentSchemas,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    getPreviousPageParam: (lastPage) => {
      if (lastPage.page > 1) {
        return lastPage.page - 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  return (
    <div className="h-[1500px] border">
      <ThemeToggle />
      <SubscriptionButton
        tmdbId={movie.tmdbId}
        isSubscribed={movie.isSubscribed}
      />
      <div className="text-2xl font-extrabold flex justify-between">
        <Typography variant="large">
          {data?.pages?.[0]?.totalComments} {t("movie.comments.comments")}
        </Typography>
        <Typography variant="large">
          {" "}
          {movie.likesNumber} {t("movie.likes.likes")}
        </Typography>
        <LikeButton
          tmdbId={movie.tmdbId}
          isLiked={movie.isLikedByUser}
        ></LikeButton>
      </div>
      <div>
        <PostComment tmdbId={movie.tmdbId} />
      </div>
      <div>
        {data?.pages.map((page) =>
          page.comments.map((comment) => (
            <div key={comment.id} className="border-b py-2">
              {comment.isOwnComment && (
                <DeleteCommentButton
                  commentId={comment.id}
                  tmdbId={movie.tmdbId}
                />
              )}
              {comment.isOwnComment && (
                <EditCommentButton
                  commentId={comment.id}
                  tmdbId={movie.tmdbId}
                  initialContent={comment.content}
                />
              )}
              <Typography>{comment.user.username}:</Typography>
              <Typography variant="small">
                {comment.content} {comment.isOwnComment}
              </Typography>
              <div className="flex">
                <ThumbsUp
                  className={`transition-colors ${
                    comment.isLikedByUser
                      ? "text-primary fill-primary"
                      : "text-gray-500"
                  }`}
                />
                {comment.likesNumber}
              </div>
            </div>
          ))
        )}
      </div>
      <button
        className="cursor-pointer"
        disabled={!hasNextPage || isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {isFetchingNextPage ? "Chargement..." : "Charger plus"}
      </button>
    </div>
  );
};

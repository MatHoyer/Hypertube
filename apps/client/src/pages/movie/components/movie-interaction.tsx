import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  deleteCommentLikeSchemas,
  deleteCommentSchemas,
  deleteMovieLikeSchemas,
  deleteMovieSubscribeSchemas,
  getMovieCommentSchemas,
  getUrl,
  ParentTypes,
  patchCommentSchemas,
  postCommentLikeSchemas,
  postMovieCommentSchemas,
  postMovieLikeSchemas,
  postMovieSubscribeSchemas,
  ROUTES,
  type TGetMovieCommentsSchemas,
  type TGetMovieSchemas,
  type TMovieSchema,
  type TParentType,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { t } from "i18next";
import { MoreVertical, ThumbsUp } from "lucide-react";
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
  tmdbId: TMovieSchema["tmdbId"];
  isLiked: boolean;
  likesNumber: number;
}> = ({ commentId, tmdbId, isLiked, likesNumber }) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: isLiked ? "DELETE" : "POST",
        url: getUrl("api-comments-like", { commentId }),
        schemas: isLiked ? deleteCommentLikeSchemas : postCommentLikeSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-comments", tmdbId] });
    },
  });

  return (
    <BaseLikeButton
      isLiked={isLiked}
      likesNumber={likesNumber}
      onToggle={() => mutate()}
      likeType={ParentTypes.COMMENT}
    />
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => postComment(newComment)}>
                {t("movie.comments.sendComment")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("movie.comments.tooltip.sendComment")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </InputGroupAddon>{" "}
    </InputGroup>
  );
};

const CommentActionsDropdown: React.FC<{
  commentId: TCommentSchema["id"];
  tmdbId: TMovieSchema["tmdbId"];
  initialContent: TCommentSchema["content"];
}> = ({ commentId, tmdbId, initialContent }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
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

  if (isEditing) {
    return (
      <EditCommentButton
        commentId={commentId}
        tmdbId={tmdbId}
        initialContent={initialContent}
        setIsEditing={setIsEditing}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="relative w-60">
        <Button className="rounded-full size-fit p-0">
          <MoreVertical />{" "}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            {t("movie.comments.editComment")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => deleteComment()}
            disabled={isDeleting}
          >
            {t("movie.comments.deleteComment")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const EditCommentButton: React.FC<{
  commentId: TCommentSchema["id"];
  tmdbId: TMovieSchema["tmdbId"];
  initialContent: TCommentSchema["content"];
  setIsEditing: (value: boolean) => void;
}> = ({ commentId, tmdbId, initialContent, setIsEditing }) => {
  const queryClient = useQueryClient();
  const [editedContent, setEditedContent] = useState(initialContent);

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

  const handleCancel = () => {
    setEditedContent(initialContent);
    setIsEditing(false);
  };

  return (
    <InputGroup>
      <InputGroupInput
        placeholder={t("movie.comments.editComment")}
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled={isPending} onClick={() => handleCancel()}>
                {t("movie.comments.cancel")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("movie.comments.tooltip.cancel")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isPending}
                onClick={() => patchComment(editedContent)}
              >
                {t("movie.comments.save")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("movie.comments.tooltip.edit")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </InputGroupAddon>{" "}
    </InputGroup>
  );
};

const CommentComponent: React.FC<{
  comment: TGetMovieCommentsSchemas["response"]["comments"][number];
  tmdbId: TMovieSchema["tmdbId"];
}> = ({ comment, tmdbId }) => {
  return (
    <div className="border-b py-2">
      {comment.isOwnComment && (
        <CommentActionsDropdown
          commentId={comment.id}
          tmdbId={tmdbId}
          initialContent={comment.content}
        />
      )}
      <Typography>{comment.user.displayUsername}:</Typography>
      <Typography variant="small">
        {comment.content} {comment.isOwnComment}
      </Typography>
      <div className="flex">
        <CommentLikeButton
          commentId={comment.id}
          tmdbId={tmdbId}
          isLiked={comment.isLikedByUser}
          likesNumber={comment.likesNumber}
        />
      </div>
    </div>
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
        <MovieLikeButton
          tmdbId={movie.tmdbId}
          isLiked={movie.isLikedByUser}
          likesNumber={movie.likesNumber}
        />
      </div>
      <div>
        <PostComment tmdbId={movie.tmdbId} />
      </div>
      <div>
        {data?.pages.map((page) =>
          page.comments.map((comment) => (
            <CommentComponent
              key={comment.id}
              comment={comment}
              tmdbId={movie.tmdbId}
            />
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

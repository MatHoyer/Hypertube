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
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  deleteMovieLikeSchemas,
  deleteMovieSubscribeSchemas,
  getMovieCommentSchemas,
  getUrl,
  postMovieCommentSchemas,
  postMovieLikeSchemas,
  postMovieSubscribeSchemas,
  ROUTES,
  type TGetMovieSchemas,
  type TMovieSchema,
} from "@hypertube/libs";
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
                isLiked
                  ? "text-[var(--primary)] fill-[var(--primary)]"
                  : "text-gray-500"
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
      {" "}
      <InputGroupInput
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && newComment) {
            postComment(newComment);
          }
        }}
      />{" "}
      <InputGroupAddon align="inline-start"></InputGroupAddon>{" "}
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
        <span>{data?.pages?.[0]?.totalComments} Commentaires</span>
        <span>{movie.likesNumber} Likes</span>
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
              <span className="font-semibold">{comment.user.username}:</span>{" "}
              <span>{comment.content}</span>
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

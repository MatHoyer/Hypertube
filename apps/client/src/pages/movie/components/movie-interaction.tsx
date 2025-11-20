import { LoadingButton } from "@/components/LoadingButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
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
  deleteMovieSubscribeSchemas,
  getMovieCommentSchemas,
  getUrl,
  ParentTypes,
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
import { ChevronDown } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PostMovieComment } from "./movie-interactions/comments-actions";
import { CommentComponent } from "./movie-interactions/comments-structure";
import { MovieLikeButton } from "./movie-interactions/likes";

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
          {movie.likesNumber} {t("movie.likes.likes")}
        </Typography>
        <MovieLikeButton
          tmdbId={movie.tmdbId}
          isLiked={movie.isLikedByUser}
          likesNumber={movie.likesNumber}
        />
      </div>
      <div>
        <PostMovieComment tmdbId={movie.tmdbId} />
      </div>
      <div>
        {data?.pages.map((page) =>
          page.comments.map((comment) => (
            <CommentComponent
              key={comment.id}
              comment={comment}
              parent={{ id: movie.tmdbId, type: ParentTypes.MOVIE }}
            />
          ))
        )}
      </div>
      <LoadingButton
        variant="ghost"
        loading={isFetchingNextPage}
        disabled={!hasNextPage || isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {hasNextPage ? <ChevronDown /> : null}
      </LoadingButton>
    </div>
  );
};

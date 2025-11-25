import { LoadingButton } from "@/components/LoadingButton";
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
import { BellOff, BellRing, ChevronDown } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Comment } from "./movie-interactions/comment/comment";
import { PostMovieComment } from "./movie-interactions/comment/post-comment";
import { MovieLikeButton } from "./movie-interactions/like/like";

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
          <Button variant="ghost" onClick={() => toggleSubscription()}>
            {isSubscribed ? <BellOff /> : <BellRing />}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="w-64">
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
  movie: NonNullable<TGetMovieSchemas["response"]>;
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status: _,
  } = useInfiniteQuery({
    queryKey: getQueryKey(ROUTES.API.MOVIES_COMMENT, { tmdbId: movie.tmdbId }),
    queryFn: ({ pageParam }) =>
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
    initialPageParam: 1,
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex">
        <Typography variant="large">
          {data?.pages?.[0]?.totalComments} {t("movie.comments.comments")}
        </Typography>
        <div className="flex-1" />
        <SubscriptionButton
          tmdbId={movie.tmdbId}
          isSubscribed={movie.isSubscribed}
        />
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
            <Comment
              key={comment.id}
              comment={comment}
              parent={{ id: movie.tmdbId, type: ParentTypes.MOVIE }}
            />
          ))
        )}
      </div>
      {hasNextPage && (
        <LoadingButton
          variant="ghost"
          loading={isFetchingNextPage}
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          <ChevronDown />
        </LoadingButton>
      )}
    </div>
  );
};

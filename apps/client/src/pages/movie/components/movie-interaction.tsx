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
  deleteMovieSubscribeSchemas,
  getMovieCommentSchemas,
  getUrl,
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
import { ThumbsUp } from "lucide-react";
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
        <TooltipTrigger>
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

// fetchnextpage refait la requete avec l'aide de getnextpageparam qu lui fournit les params et queryfn qui lui donne l'url
export const MovieInteraction = ({
  movie,
}: {
  movie: TGetMovieSchemas["response"];
}) => {
  const queryClient = useQueryClient();

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

  const likeMutation = useMutation({
    mutationFn: (tmdbId: number) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.MOVIES_LIKE, { tmdbId }),
        schemas: postMovieLikeSchemas,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie", movie.tmdbId] });
      toast.success("Movie liked!");
    },
    onError: (error) => {
      toast.error("Failed to like movie");
      console.error("Like error:", error);
    },
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
        <Button
          variant="ghost"
          onClick={() => likeMutation.mutate(movie.tmdbId)}
        >
          <ThumbsUp
            className={`transition-colors ${
              movie.isLikedByUser ? "text-blue-500" : "text-gray-500"
            }`}
          />
        </Button>
      </div>
      <div>
        <InputGroup>
          <InputGroupInput placeholder={"Add a comment..."} />
          <InputGroupAddon align="inline-start"></InputGroupAddon>
        </InputGroup>
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

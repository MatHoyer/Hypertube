import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
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
  getUrl,
  postMovieSubscribeSchemas,
  ROUTES,
  type TMovieSchema,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export const MovieInteraction: React.FC<{
  tmdbId: TMovieSchema["tmdbId"];
  isSubscribed: boolean;
}> = ({ tmdbId, isSubscribed }) => {
  return (
    <div className="h-[1500px] border">
      <ThemeToggle />
      <SubscriptionButton tmdbId={tmdbId} isSubscribed={isSubscribed} />
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { supportedOAuths } from "@/lib/better-auth/constants";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import type { TBetterAuthProviders } from "@hypertube/libs";
import {
  getUrl,
  ROUTES,
  signInSocialAuthentificationSchemas,
} from "@hypertube/libs";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const OAuthButtons = () => {
  const linkMutation = useMutation({
    mutationFn: (provider: { id: TBetterAuthProviders }) =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.AUTHENTIFICATION_SIGNIN_SOCIAL),
        schemas: signInSocialAuthentificationSchemas,
        data: {
          providerId: provider.id,
        },
      }),
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_self");
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <div className="flex justify-evenly gap-4">
      {Object.entries(supportedOAuths).map(([providerId, params]) => (
        <Button
          key={providerId}
          onClick={() =>
            linkMutation.mutate({
              id: providerId as TBetterAuthProviders,
            })
          }
          type="button"
          className="light bg-background"
        >
          <img
            src={params.img}
            className="size-6"
            draggable={false}
            alt={params.name}
            title={params.name}
          />
        </Button>
      ))}
    </div>
  );
};

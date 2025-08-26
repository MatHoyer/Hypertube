import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export const OAuthButtons = () => {
  const handleOAuth = async (provider: string) => {
    await authClient.signIn.social({
      provider: provider,
    });
  };
  const handle42OAuth = async () => {
    await authClient.signIn.oauth2({
      providerId: "school42",
    });
  };
  return (
    <div className="flex justify-evenly">
      <Button onClick={() => handleOAuth("google")} type="button">
        <img
          src="/images/oauth_logo/google_logo.png"
          className="size-6"
          draggable={false}
          alt="Google"
          title="Google"
        />
      </Button>
      <Button onClick={() => handleOAuth("github")} type="button">
        <img
          src="/images/oauth_logo/github_logo.svg"
          className="size-6"
          draggable={false}
          alt="GitHub"
          title="GitHub"
        />
      </Button>
      <Button onClick={() => handleOAuth("discord")} type="button">
        <img
          src="/images/oauth_logo/discord_logo.webp"
          className="size-6"
          draggable={false}
          alt="Discord"
          title="Discord"
        />
      </Button>
      <Button onClick={() => handle42OAuth()} type="button">
        <img
          src="/images/oauth_logo/42_logo.png"
          className="size-6"
          draggable={false}
          alt="42 School"
          title="42 School"
        />
      </Button>
    </div>
  );
};

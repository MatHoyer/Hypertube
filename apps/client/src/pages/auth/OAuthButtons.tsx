import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const OAuthButtons = () => {
  const handleOAuth = async (provider: string) => {
    await authClient.signIn.social({
      provider: provider,
    });
  };

  return (
    <div className="flex justify-evenly gap-4">
      <Button
        onClick={() => handleOAuth("google")}
        type="button"
        className="light bg-background"
      >
        <img
          src="/images/oauth_logo/google_logo.png"
          className="size-6"
          draggable={false}
          alt="Google"
          title="Google"
        />
      </Button>
      <Button
        onClick={() => handleOAuth("github")}
        type="button"
        className="light bg-background"
      >
        <img
          src="/images/oauth_logo/github_logo.svg"
          className="size-6"
          draggable={false}
          alt="GitHub"
          title="GitHub"
        />
      </Button>
      <Button
        onClick={() => handleOAuth("discord")}
        type="button"
        className="light bg-background"
      >
        <img
          src="/images/oauth_logo/discord_logo.webp"
          className="size-6"
          draggable={false}
          alt="Discord"
          title="Discord"
        />
      </Button>
      <Button
        onClick={() => handleOAuth("school42")}
        type="button"
        className="light bg-background"
      >
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

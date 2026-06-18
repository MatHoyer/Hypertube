import type { TBetterAuthProviders } from "@hypertube/libs";

export const supportedOAuths: Record<
  TBetterAuthProviders,
  { name: string; img: string }
> = {
  google: {
    name: "Google",
    img: "/images/oauth_logo/google_logo.png",
  },
  github: {
    name: "Github",
    img: "/images/oauth_logo/github_logo.svg",
  },
  discord: {
    name: "Discord",
    img: "/images/oauth_logo/discord_logo.webp",
  },
  school42: {
    name: "42 School",
    img: "/images/oauth_logo/42_logo.png",
  },
} as const;
export type TSupportedOAuths = keyof typeof supportedOAuths;

export const credentialId = "credential";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLoader } from "./ui/app-loader";
import { Typography } from "./ui/typography";

const loadingResources = [
  "global",
  "movie",
  "profile",
  "casting",
  "historic",
  "playlists",
  "playlist",
] as const;

export const LoadingResource: React.FC<{
  resource: (typeof loadingResources)[number];
}> = ({ resource }) => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!loadingResources.includes(resource) || !showLoader) {
    return null;
  }

  return (
    <div className="size-full flex flex-col justify-center items-center gap-4">
      <AppLoader size={60} />
      <Typography variant="h3">
        {t("global.loadingMessage", {
          resource: t(`${resource}.loadingRessource`),
        })}
      </Typography>
    </div>
  );
};

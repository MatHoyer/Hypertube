import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLoader } from "./ui/app-loader";
import { Typography } from "./ui/typography";

const loadingPages = ["global", "movie"] as const;

export const LoadingPage: React.FC<{
  resource: (typeof loadingPages)[number];
}> = ({ resource }) => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!loadingPages.includes(resource) || !showLoader) {
    return null;
  }

  return (
    <div className="size-full flex flex-col justify-center items-center gap-4">
      <AppLoader size={60} />
      <Typography variant="h3" className="text-center">
        {t("global.loadingMessage", {
          resource: t(`${resource}.loadingRessource`),
        })}
      </Typography>
    </div>
  );
};

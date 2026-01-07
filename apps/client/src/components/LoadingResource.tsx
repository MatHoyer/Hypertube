import { resourceTypes } from "@/lib/const";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLoader } from "./ui/app-loader";
import { Typography } from "./ui/typography";

export const LoadingResource: React.FC<{
  resource: (typeof resourceTypes)[number];
}> = ({ resource }) => {
  const { t } = useTranslation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (!resourceTypes.includes(resource) || !showLoader) {
    return null;
  }

  return (
    <div className="size-full flex flex-col justify-center items-center gap-4">
      <AppLoader size={60} />
      <Typography variant="h3">
        {t("global.loadingMessage", {
          resource: t(`loadingResource.${resource}`),
        })}
      </Typography>
    </div>
  );
};

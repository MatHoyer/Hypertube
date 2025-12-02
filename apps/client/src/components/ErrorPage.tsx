import { useTranslation } from "react-i18next";
import { AppLoader } from "./ui/app-loader";
import { Typography } from "./ui/typography";

const errorPages = ["global", "profile"] as const;

export const ErrorPage: React.FC<{
  resource: (typeof errorPages)[number];
}> = ({ resource }) => {
  const { t } = useTranslation();

  if (!errorPages.includes(resource)) {
    return null;
  }

  return (
    <div className="size-full flex flex-col justify-center items-center gap-4">
      <AppLoader size={60} />
      <Typography variant="h3">
        {t("global.errorMessage", {
          resource: t(`${resource}.errorRessource`),
        })}
      </Typography>
    </div>
  );
};

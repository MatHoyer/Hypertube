import { useTranslation } from "react-i18next";
import { Typography } from "./ui/typography";

const errorResources = ["global", "profile", "casting"] as const;

export const ErrorResource: React.FC<{
  resource: (typeof errorResources)[number];
}> = ({ resource }) => {
  const { t } = useTranslation();

  if (!errorResources.includes(resource)) {
    return null;
  }

  return (
    <div className="size-full flex flex-col justify-center items-center gap-4">
      <Typography variant="h3">
        {t("global.errorMessage", {
          resource: t(`${resource}.errorRessource`),
        })}
      </Typography>
    </div>
  );
};

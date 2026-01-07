import { RESOURCE_TYPES } from "@/lib/const";
import { useTranslation } from "react-i18next";
import { Typography } from "./ui/typography";

export const ErrorResource: React.FC<{
  resource: (typeof RESOURCE_TYPES)[number];
}> = ({ resource }) => {
  const { t } = useTranslation();

  if (!RESOURCE_TYPES.includes(resource)) {
    return null;
  }

  return (
    <div className="size-full flex flex-col justify-center items-center gap-4">
      <Typography variant="h3">
        {t("global.errorMessage", {
          resource: t(`errorResource.${resource}`),
        })}
      </Typography>
    </div>
  );
};

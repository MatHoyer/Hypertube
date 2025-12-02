import { ImageAvatar } from "@/components/images/Avatar";
import { Typography } from "@/components/ui/typography";
import { getNearDateWithLocale } from "@/lib/utils";
import { Calendar } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

export const UserProfile: React.FC<{
  imageSrc: string;
  name: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}> = ({ imageSrc, name, firstName, lastName, createdAt }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 items-center">
      <ImageAvatar imageSrc={imageSrc} name={name} size="lg" />
      <div>
        <Typography textSize="lg">{name}</Typography>
        <div className="flex">
          <Typography>{firstName}</Typography>

          <Typography className="ml-1">{lastName}</Typography>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Calendar />
        <Typography textColor="muted" textSize="sm">
          {`${t("profile.joined")} ${getNearDateWithLocale({
            date: createdAt,
          })}`}
        </Typography>
      </div>
    </div>
  );
};

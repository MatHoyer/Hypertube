import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { errorCodes } from "@/lib/better-auth/constants";
import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

export const SignErrorCard: React.FC<{ authMessageError: string }> = ({
  authMessageError,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="flex gap-0 py-0 light bg-background">
      <div className="flex items-center justify-center">
        <Typography
          variant="h3"
          className="flex items-center gap-2 mt-5 text-destructive"
        >
          <CircleAlert />
          {"Login failed."}
        </Typography>
      </div>
      <Typography variant="p" className="flex m-5">
        {t(
          `better-auth-error.${authMessageError}` as (typeof errorCodes)[number]
        )}
      </Typography>
    </Card>
  );
};

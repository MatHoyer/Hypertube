import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import type { DownloadState } from "@hypertube/libs";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

export const DownloadButton: React.FC<
  PropsWithChildren & { downloadState: DownloadState }
> = ({ children, downloadState }) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          layout="card"
          variant="outline"
          className="flex flex-col items-start w-40"
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Typography>
          {t(`movie.downloadPage.tooltip.${downloadState}`)}
        </Typography>
      </TooltipContent>
    </Tooltip>
  );
};

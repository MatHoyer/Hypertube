import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { DownloadStates, type DownloadState } from "@hypertube/libs";
import type { ComponentProps, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

export const DownloadButton: React.FC<
  PropsWithChildren &
    ComponentProps<typeof Button> & {
      downloadState: DownloadState;
    }
> = ({ children, downloadState, className, ...props }) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Button
            layout="card"
            variant="outline"
            className={cn("flex flex-col items-start w-40", className)}
            disabled={downloadState !== DownloadStates.NOT_DOWNLOADED}
            {...props}
          >
            {children}
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <Typography>
          {t(`movie.downloadPage.tooltip.${downloadState}`)}
        </Typography>
      </TooltipContent>
    </Tooltip>
  );
};

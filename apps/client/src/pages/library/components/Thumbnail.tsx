import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { PlaylistDropdownMenu } from "@/components/playlists/PlaylistDropdownMenu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type TGetMoviesSchemas } from "@hypertube/libs";
import { Check } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export const Thumbnail: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = memo(({ movie }) => {
  const { t } = useTranslation();

  return (
    <div>
      <Card
        className="flex gap-0 p-2 md:p-4 items-center rounded-b-none hover:bg-card/20 cursor-pointer min-h-[332px]"
        onClick={() => openDialog("movie", movie.details)}
      >
        <MovieBaseInfo movie={movie.details} posterSize="md" info="partial" />
      </Card>
      <Card className="p-2 rounded-t-none border-t-0">
        <div className="flex gap-2 w-full items-center justify-between">
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              {getDownloadStateIcon(movie.downloadState)}
            </TooltipTrigger>
            <TooltipContent>
              {t(`movie.downloadPage.tooltip.${movie.downloadState}`)}
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            {movie.isSeen && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={"success"}>
                    <Check />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{t("library.seen")}</TooltipContent>
              </Tooltip>
            )}
            <PlaylistDropdownMenu movie={movie} />
          </div>
        </div>
      </Card>
    </div>
  );
});

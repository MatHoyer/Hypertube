import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { type TGetMoviesSchemas } from "@hypertube/libs";
import { Check, EllipsisVertical, Plus } from "lucide-react";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PlaylistList } from "./PlaylistList";

export const Thumbnail: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = memo(({ movie }) => {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <EllipsisVertical size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[208px]"
                side="top"
                align="start"
              >
                <DropdownMenuLabel>
                  <Typography textSize="lg">{t("playlist.save")}</Typography>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <PlaylistList movie={movie} />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setTimeout(() => openDialog("playlist"), 200);
                  }}
                >
                  <Plus />
                  {t("playlist.new")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
});

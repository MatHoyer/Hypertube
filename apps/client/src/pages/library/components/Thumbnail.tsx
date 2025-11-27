import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { Logo } from "@/components/images/Logo";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type TGetMoviesSchemas } from "@hypertube/libs";
import { Check, EllipsisVertical } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

export const Thumbnail: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = memo(({ movie }) => {
  const movieSeen = true; //TODO : movieSeen by user
  const { t } = useTranslation();

  if (!movie)
    return (
      <Card className="flex flex-col justify-center items-center">
        <Logo size="lg" />
      </Card>
    );

  return (
    <div>
      <Card
        className="flex gap-0 p-2 md:p-4 items-center rounded-b-none hover:bg-card/20 cursor-pointer"
        onClick={() => openDialog("movie", movie)}
      >
        <MovieBaseInfo movie={movie} posterSize="md" info="partial" />
      </Card>
      <Card className="p-2 rounded-t-none border-t-0">
        <div className="flex gap-2 w-full items-center justify-between">
          <Tooltip>
            <TooltipTrigger className="flex items-center">
              {getDownloadStateIcon(movie.status)}
            </TooltipTrigger>
            <TooltipContent>
              {t(`movie.downloadPage.tooltip.${movie.status}`)}
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            {movieSeen && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant={"success"}>
                    <Check />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{t("movie.page.seen")}</TooltipContent>
              </Tooltip>
            )}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <EllipsisVertical size={15} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Default playlist</DropdownMenuItem>
                  <DropdownMenuItem>Choose playlist</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
});

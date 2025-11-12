import { openDialog } from "@/components/dialogs/dialog.store";
import { Logo } from "@/components/images/Logo";
import { MovieBaseInfo } from "@/components/movies/MovieBaseInfo";
import { AppLoader } from "@/components/ui/app-loader";
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
import { DownloadStates, type TGetMoviesSchemas } from "@hypertube/libs";
import {
  Check,
  CheckIcon,
  CircleX,
  Clock,
  EllipsisVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export const Thumbnail: React.FC<{
  movie: TGetMoviesSchemas["response"]["movies"][number];
}> = ({ movie }) => {
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
        className="flex gap-0 p-2 md:p-4 items-center rounded-b-none"
        onClick={() => openDialog("movie", movie)}
      >
        <MovieBaseInfo movie={movie} posterSize="md" info="partial" />
      </Card>
      <Card className="p-2 rounded-t-none border-t-0">
        <div className="flex gap-2 w-full items-center justify-between">
          <div className="overflow-hidden">
            <Tooltip>
              <TooltipTrigger className="flex items-center">
                {movie.status === DownloadStates.DOWNLOADED && <CheckIcon />}
                {movie.status === DownloadStates.DOWNLOADING && <AppLoader />}
                {movie.status === DownloadStates.WAITING && <Clock />}
                {movie.status === DownloadStates.NOT_DOWNLOADED && <CircleX />}
              </TooltipTrigger>
              <TooltipContent>
                {t(`movie.downloadPage.tooltip.${movie.status}`)}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            {movieSeen && (
              <Badge variant={"success"}>
                <Check />
              </Badge>
            )}
            <DropdownMenu>
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
};

import { openDialog } from "@/components/dialogs/dialog.store";
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
import type { TTmdbMovieSchema } from "@hypertube/libs";
import { Check, EllipsisVertical, Info } from "lucide-react";

export const Thumbnail: React.FC<{ movie: TTmdbMovieSchema }> = ({ movie }) => {
  const movieSee = true; //TODO : movieSeen by user

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
            <Badge variant={"outline"}>
              <Info />
              Status
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {movieSee && (
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

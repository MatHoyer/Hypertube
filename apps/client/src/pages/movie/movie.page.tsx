import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import VideoPlayer from "./components/video-player";

const MovieInfo = () => {
  return (
    <div className="grid grid-rows-2 gap-4 h-full">
      <Card className="grid grid-cols-2 gap-2 p-4">
        <div className="grid grid-rows-2 gap-2">
          <Typography variant="h2">Movie Title</Typography>
          <Typography variant="p">Movie Description</Typography>
        </div>
        <img src="https://via.placeholder.com/150" />
      </Card>
      <Card className="flex flex-col gap-2 p-4">
        <Typography variant="h2">Cast</Typography>
        <Typography variant="p">Cast Description</Typography>
      </Card>
    </div>
  );
};

const Interactions = () => {
  return (
    <div className="h-[1500px]">
      <ThemeToggle />
    </div>
  );
};

const MoviePage = () => {
  return (
    <div className="grid grid-cols-3 gap-4 size-full">
      <ScrollArea className="col-span-2 flex flex-col gap-4 h-[calc(100vh)] p-4">
        <div>
          <VideoPlayer />
        </div>
        <div className="border">
          <Interactions />
        </div>
      </ScrollArea>

      <div className="sticky top-0">
        <MovieInfo />
      </div>
    </div>
  );
};

export default MoviePage;

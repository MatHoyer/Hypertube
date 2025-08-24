import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

const MovieInfo = () => {
  return (
    <div className="grid grid-rows-2 gap-4 h-full p-4">
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

export default MovieInfo;

import { Star } from "lucide-react";
import type { ComponentProps } from "react";
import { Typography } from "../ui/typography";

export const ScoreRated: React.FC<
  ComponentProps<"div"> & { score: number; total?: number }
> = ({ score, total = 10 }, ...props) => {
  return (
    <div {...props} className="flex items-center">
      <Typography variant="mono">
        {score.toPrecision(2)}/{total}
      </Typography>
      <Star color="black" fill="yellow" size={15} />
    </div>
  );
};

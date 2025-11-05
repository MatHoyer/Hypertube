import { Star } from "lucide-react";
import type { ComponentProps } from "react";
import { Typography } from "../ui/typography";

export const ScoreRated: React.FC<
  ComponentProps<"div"> & { score: number; total?: number }
> = ({ score, total = 10 }, ...props) => {
  return (
    <div className="flex" {...props}>
      <Typography variant="mono">
        {score.toPrecision(2)}/{total}
      </Typography>
      <Star color="black" fill="yellow" />
    </div>
  );
};

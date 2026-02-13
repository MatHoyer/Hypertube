import { Star } from "lucide-react";
import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Typography } from "../ui/typography";

export const ScoreRated: React.FC<
  ComponentProps<"div"> & { score: number; voteCount: number; total?: number }
> = ({ score, voteCount, total = 10 }, ...props) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger>
        <div {...props} className="flex items-center">
          <Typography textSize="sm" className="font-mono">
            {score.toPrecision(2)}/{total}
          </Typography>
          <Star color="black" fill="yellow" size={15} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <Typography>
          {voteCount}{" "}
          {voteCount > 1 ? t("library.evaluations") : t("library.evaluation")}
        </Typography>
      </TooltipContent>
    </Tooltip>
  );
};

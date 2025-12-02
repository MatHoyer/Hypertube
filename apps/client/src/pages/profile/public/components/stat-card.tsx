import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

export const StatCard: React.FC<{
  color: string;
  icon: JSX.Element;
  count: number;
  label: string;
}> = ({ color, icon, count, label }) => {
  return (
    <Card className="border-2 w-1/4">
      <CardContent className="flex items-center gap-3 size-full">
        <div
          className={cn(
            "flex items-center justify-center p-4 rounded-full",
            color
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <Typography textSize="lg">{count}</Typography>
          <Typography>{label}</Typography>
        </div>
      </CardContent>
    </Card>
  );
};

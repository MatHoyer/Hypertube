import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { ActivePill } from "./animated/ActivePill";

type TUniqueFilterProps = {
  value: string;
  onChange: (value: string) => void;
  values: Record<string, string>;
  layoutId: string;
};

export const UniqueFilter: React.FC<
  TUniqueFilterProps &
    Omit<ComponentProps<"div">, "value" | "onChange" | "values">
> = ({ value, onChange, values, layoutId, className, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1",
        className
      )}
      {...props}
    >
      {Object.entries(values).map(([key, label]) => (
        <Button
          key={key}
          onClick={() => onChange(key)}
          variant="ghost"
          size="sm"
          className="relative"
        >
          {value === key && <ActivePill layoutId={layoutId} />}
          <span className="relative z-10">{label}</span>
        </Button>
      ))}
    </div>
  );
};

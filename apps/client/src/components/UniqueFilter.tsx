import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typedEntries } from "@hypertube/libs";
import type { ComponentProps } from "react";
import { ActivePill } from "./animated/ActivePill";

type TUniqueFilterProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  values: Record<T, string>;
  layoutId: string;
};

export const UniqueFilter = <T extends string>({
  value,
  onChange,
  values,
  layoutId,
  className,
  ...props
}: TUniqueFilterProps<T> &
  Omit<ComponentProps<"div">, "value" | "onChange" | "values">) => {
  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-lg p-1", className)}
      {...props}
    >
      {typedEntries(values).map(([key, label]) => (
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

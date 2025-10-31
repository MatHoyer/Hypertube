import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

type TUniqueFilterProps = {
  value: string;
  onChange: (value: string) => void;
  values: Record<string, string>;
};

export const UniqueFilter: React.FC<TUniqueFilterProps> = ({
  value,
  onChange,
  values,
}) => {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1">
      {Object.entries(values).map(([key, label]) => (
        <Button
          key={key}
          onClick={() => onChange(key)}
          variant="ghost"
          size="sm"
          className="relative"
        >
          {value === key && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 rounded-md bg-background shadow-sm"
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </Button>
      ))}
    </div>
  );
};

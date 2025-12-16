import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const FloatingBar: React.FC<ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("fixed w-full z-10 bottom-0 right-0 pointer-events-none")}
    >
      <div className={cn("flex w-full p-4 justify-center relative")}>
        <div
          className={cn(
            "flex justify-center rounded-lg bg-muted border border-card p-1 pointer-events-auto",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

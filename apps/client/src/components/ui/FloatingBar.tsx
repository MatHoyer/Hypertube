import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const FloatingBar: React.FC<ComponentProps<"div">> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("fixed w-full z-10 bottom-0 right-0")}>
      <div className={cn("flex w-full p-4 justify-center relative")}>
        <div
          className={cn(
            "flex justify-center bg-background rounded-lg",
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

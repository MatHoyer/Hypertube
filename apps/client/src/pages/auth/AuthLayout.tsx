import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const AuthLayout: React.FC<ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className="relative flex flex-col size-full justify-center items-center">
      <Card
        className={cn(
          "flex flex-col items-center relative h-full w-full md:h-fit md:w-fit md:rounded-2xl p-8 overflow-y-scroll md:overflow-auto",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </div>
  );
};

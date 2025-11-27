import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const AuthLayout: React.FC<
  ComponentProps<"div"> & {
    title: string;
  }
> = ({ title, children, className, ...props }) => {
  return (
    <div className="flex size-full justify-center items-center">
      <Card
        className={cn("flex items-center p-8 w-full md:w-[450px]", className)}
        {...props}
      >
        <Typography variant="h1">{title}</Typography>
        {children}
      </Card>
    </div>
  );
};

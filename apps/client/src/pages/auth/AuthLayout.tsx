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
    <div className="flex flex-col size-full justify-center items-center">
      <Card
        className={cn("flex flex-col items-center p-8", className)}
        {...props}
      >
        <Typography variant="h1" className="text-center">
          {title}
        </Typography>
        {children}
      </Card>
    </div>
  );
};

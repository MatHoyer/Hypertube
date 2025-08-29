import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Typography } from "./typography";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

const TextSeparator: React.FC<React.ComponentProps<typeof Typography>> = ({
  className,
  ...props
}) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <Separator className="flex-1" />
      <Typography
        variant="small"
        className={cn("text-muted-foreground", className)}
        {...props}
      />
      <Separator className="flex-1" />
    </div>
  );
};

export { Separator, TextSeparator };

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

export const AppLoader: React.FC<ComponentProps<typeof Loader2>> = ({
  className,
  ...props
}) => {
  return <Loader2 className={cn("animate-spin", className)} {...props} />;
};

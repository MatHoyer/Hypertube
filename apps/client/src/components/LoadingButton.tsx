import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { AppLoader } from "./ui/app-loader";
import { Button } from "./ui/button";

export const LoadingButton = ({
  loading,
  children,
  className,
  ...props
}: ComponentProps<typeof Button> & {
  loading?: boolean;
  success?: string;
}) => {
  return (
    <Button {...props} className={cn(className, "relative")}>
      <motion.span
        className="flex items-center gap-1"
        animate={{
          opacity: loading ? 0 : 1,
          y: loading ? -10 : 0,
        }}
      >
        {children}
      </motion.span>
      <motion.span
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: loading ? 1 : 0,
          y: loading ? 0 : 10,
        }}
        exit={{
          opacity: 0,
          y: 10,
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <AppLoader size={20} />
      </motion.span>
    </Button>
  );
};

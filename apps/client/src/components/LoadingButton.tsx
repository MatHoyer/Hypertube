import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { type ComponentProps, useEffect, useState } from "react";
import { AppLoader } from "./ui/app-loader";
import { Button } from "./ui/button";

type LoadingButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
  success?: boolean;
};

export const LoadingButton = ({
  loading,
  success,
  children,
  className,
  onClick,
  ...props
}: LoadingButtonProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [firstMounted, setFirstMounted] = useState(true);

  useEffect(() => {
    if (firstMounted) {
      setFirstMounted(false);
    }

    if (!loading && success !== undefined && !firstMounted) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success]);

  const isAnimating = loading || showSuccess;

  return (
    <Button
      disabled={loading}
      onClick={
        showSuccess
          ? () => {
              setShowSuccess(false);
            }
          : onClick
      }
      {...props}
      className={cn(className, "relative")}
    >
      <motion.span
        className="flex items-center gap-1"
        animate={{
          opacity: isAnimating ? 0 : 1,
          y: isAnimating ? -10 : 0,
        }}
      >
        {children}
      </motion.span>

      {/* Loading animation */}
      <motion.span
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: loading ? 1 : 0,
          y: loading ? 0 : 10,
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <AppLoader size={20} />
      </motion.span>

      {/* Success animation */}
      {success !== undefined && (
        <motion.span
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: showSuccess ? 1 : 0,
            scale: showSuccess ? 1 : 0.5,
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {success ? (
            <CheckIcon size={20} strokeWidth={3} className="text-green-500" />
          ) : (
            <XIcon size={20} strokeWidth={3} className="text-red-500" />
          )}
        </motion.span>
      )}
    </Button>
  );
};

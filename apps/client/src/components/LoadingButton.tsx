import { useTimeoutResetState } from "@/hooks/use-timeout-state-reset";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { type ComponentProps, useEffect, useRef } from "react";
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
  disabled,
  ...props
}: LoadingButtonProps) => {
  const { value: showSuccess, setValue: setShowSuccess } = useTimeoutResetState(
    false,
    1000
  );

  const previousLoading = useRef(loading);

  useEffect(() => {
    const wasLoading = previousLoading.current;
    previousLoading.current = loading;

    if (!wasLoading || loading) return;

    if (success !== undefined) setShowSuccess(true);
  }, [loading, success, setShowSuccess]);

  const isAnimating = loading || showSuccess;

  return (
    <Button
      disabled={loading || disabled}
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
      {isAnimating && (
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
      )}

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

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { type ComponentProps } from "react";

type ReversibleCardProps = {
  FrontComponent: React.FC<ComponentProps<typeof Card>>;
  BackComponent: React.FC<ComponentProps<typeof Card>>;
  transitionDuration?: number;
  isFlipped: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
};

export const ReversibleCardPattern: React.FC<ComponentProps<typeof Card>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <Card className={cn("size-full", className)} {...props}>
      {children}
    </Card>
  );
};

const ReversibleCard: React.FC<
  ReversibleCardProps & ComponentProps<typeof motion.div>
> = ({
  FrontComponent,
  BackComponent,
  transitionDuration = 0.3,
  isFlipped = false,
  setIsAnimating,
  className,
  ...props
}) => {
  return (
    <div style={{ perspective: "1000px" }}>
      <motion.div
        className={cn("relative", className)}
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: transitionDuration }}
        onAnimationComplete={() => setIsAnimating(false)}
        {...props}
      >
        <div className="absolute inset-0 backface-hidden">
          <FrontComponent />
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <BackComponent />
        </div>
      </motion.div>
    </div>
  );
};

export default ReversibleCard;

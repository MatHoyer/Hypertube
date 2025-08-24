import { motion } from "motion/react";
import type React from "react";
import type { ComponentProps } from "react";

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideToBottom: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  },
  slideToTop: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
  },
  slideToRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  slideToLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  },
};

const AnimateApparition: React.FC<
  {
    animation: keyof typeof animations;
    animationDuration?: number;
    isAnimating: boolean;
  } & ComponentProps<typeof motion.div>
> = ({
  animation,
  isAnimating,
  animationDuration = 0.3,
  transition,
  ...props
}) => {
  return (
    <motion.div
      initial="initial"
      animate={isAnimating ? "animate" : "exit"}
      exit="exit"
      transition={{
        ...transition,
        duration: animationDuration,
        ease: "easeInOut",
      }}
      {...props}
      variants={animations[animation]}
    />
  );
};

export default AnimateApparition;

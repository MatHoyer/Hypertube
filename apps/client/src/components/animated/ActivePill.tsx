import { motion } from "motion/react";

export const ActivePill = ({ layoutId }: { layoutId: string }) => {
  return (
    <motion.div
      layoutId={`active-pill-${layoutId}`}
      className="absolute inset-0 rounded-md bg-background shadow-sm"
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
      }}
    />
  );
};

import { cn } from "@/lib/utils";

export const Logo: React.FC<{
  size?: "sm" | "md" | "lg";
}> = ({ size = "sm" }) => {
  return (
    <img
      src="/images/Hypertube_logo.png"
      alt="Hypertube Logo"
      className={cn(
        size === "sm" && "size-10",
        size === "md" && "size-16",
        size === "lg" && "size-44"
      )}
    />
  );
};

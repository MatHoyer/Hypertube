import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const ImageAvatar: React.FC<{
  imageSrc: string;
  name: string;
  size?: "sm" | "md" | "lg";
}> = ({ imageSrc, name, size = "sm" }) => {
  return (
    <Avatar
      className={cn(
        size === "sm" && "size-10",
        size === "md" && "size-16",
        size === "lg" && "size-44"
      )}
    >
      <AvatarImage src={imageSrc} />
      <AvatarFallback
        className={cn(
          size === "sm" && "text-xl",
          size === "md" && "text-4xl",
          size === "lg" && "text-6xl"
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

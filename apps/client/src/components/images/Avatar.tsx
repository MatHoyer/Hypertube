import { useRequiredUser } from "@/hooks/use-required-user";
import { cn } from "@/lib/utils";
import { getUrl } from "@hypertube/libs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type TImageSize = "sm" | "md" | "lg";

// TODO : get UserImage with userId when GET user/:id done

export const UserImageAvatar: React.FC<{
  size?: TImageSize;
}> = ({ size = "sm" }) => {
  const user = useRequiredUser();
  return (
    <ImageAvatar
      imageSrc={getUrl("api-image", {
        imageId: user.image ?? "",
      })}
      name={user.name}
      size={size}
    />
  );
};

export const ImageAvatar: React.FC<{
  imageSrc: string | undefined;
  name: string;
  size?: TImageSize;
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

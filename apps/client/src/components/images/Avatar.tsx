import { useRequiredUser } from "@/hooks/use-required-user";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import { getImageSchemas, getUrl } from "@hypertube/libs";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type TImageSize = "sm" | "md" | "lg";

// TODO : get UserImage with userId when GET user/:id done

export const UserImageAvatar: React.FC<{
  size?: TImageSize;
}> = ({ size = "sm" }) => {
  const user = useRequiredUser();
  const isUrl = z.url().safeParse(user.image).success;

  const { data } = useQuery({
    queryKey: ["userImage", user.image],
    queryFn: async () => {
      const res = await axiosFetch({
        method: "GET",
        url: getUrl("api-image", { imageId: user.image! }),
        schemas: getImageSchemas,
        config: { responseType: "arraybuffer" },
      });
      const blob = new Blob([res], { type: "image/webp" });
      return URL.createObjectURL(blob);
    },
    retry: false,
    enabled: !!user.image && !isUrl,
  });

  return (
    <ImageAvatar
      imageSrc={isUrl ? (user.image as string) : data}
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

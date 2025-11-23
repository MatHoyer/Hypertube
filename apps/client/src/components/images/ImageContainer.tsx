import { cn } from "@/lib/utils";
import type { ComponentProps, PropsWithChildren } from "react";

export const ImageContainer: React.FC<
  {
    imageSrc: string | null;
    altImage: string;
    size?: "sm" | "md" | "lg";
  } & ComponentProps<"div"> &
    PropsWithChildren
> = ({
  imageSrc,
  altImage,
  size = "lg",
  className,
  children,
  ...containerProps
}) => {
  return (
    <div
      className={cn(
        className,
        size === "sm" && "w-[90px]",
        size === "md" && "w-[150px]",
        size === "lg" && "w-[300px]",
        "relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted"
      )}
      {...containerProps}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={altImage}
          className="object-cover absolute inset-0 w-full h-full"
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="absolute size-full inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

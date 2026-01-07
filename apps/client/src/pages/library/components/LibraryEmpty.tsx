import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Video } from "lucide-react";
import { useTranslation } from "react-i18next";

export const LibraryEmpty = () => {
  const { t } = useTranslation();

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Video />
        </EmptyMedia>
        <EmptyTitle>{t("library.noMovies")}</EmptyTitle>
        <EmptyDescription>{t("library.noMoviesDescription")}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

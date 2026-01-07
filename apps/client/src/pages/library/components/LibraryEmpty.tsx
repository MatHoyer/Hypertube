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
        <EmptyTitle>{t("movie.page.noMovies")}</EmptyTitle>
        <EmptyDescription>
          {t("movie.page.noMoviesDescription")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};

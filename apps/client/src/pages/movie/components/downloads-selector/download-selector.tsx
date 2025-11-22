import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TGetMovieSchemas } from "@hypertube/libs";
import { useTranslation } from "react-i18next";
import { DownloadResolutionSelector } from "./download-selector.resolution";
import { DownloadSubtitleSelector } from "./download-selector.subtitle";

export const DownloadsSelector: React.FC<{
  resolutions: NonNullable<TGetMovieSchemas["response"]>["resolutions"];
  subtitlesLanguages: NonNullable<TGetMovieSchemas["response"]>["subtitles"];
}> = ({ resolutions, subtitlesLanguages }) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full h-[72dvh]">
      <CardHeader>
        <CardTitle>{t("movie.downloadPage.title")}</CardTitle>
        <CardDescription>{t("movie.downloadPage.description")}</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[calc(72dvh-120px)] md:h-[calc(72dvh-100px)]">
        <CardContent className="flex flex-col gap-4">
          <DownloadResolutionSelector resolutions={resolutions} />
          <DownloadSubtitleSelector subtitles={subtitlesLanguages} />
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

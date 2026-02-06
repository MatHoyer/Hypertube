import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DownloadResolutionSelector } from "./download-selector.resolution";
import { DownloadSubtitleSelector } from "./download-selector.subtitles";

export const DownloadsSelector = () => {
  const { t } = useTranslation();

  return (
    <Card className="w-full h-[72dvh]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download />
          {t("movie.downloadPage.title")}
        </CardTitle>
        <CardDescription>{t("movie.downloadPage.description")}</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[calc(72dvh-120px)]">
        <CardContent className="flex flex-col gap-4">
          <DownloadResolutionSelector />
          <DownloadSubtitleSelector />
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

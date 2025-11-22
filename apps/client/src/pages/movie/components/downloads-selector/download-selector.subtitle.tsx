import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import type { TGetMovieSchemas } from "@hypertube/libs";
import { Captions } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DownloadButton } from "./download-selector.utils";

const DownloadSubtitleButton: React.FC<{
  subtitle: TGetMovieSchemas["response"]["subtitles"][number];
}> = ({ subtitle }) => {
  return (
    <DownloadButton downloadState={subtitle.downloadState}>
      <Typography variant="small">{subtitle.language}</Typography>
      <div className="flex items-center justify-between w-full mt-2">
        <Badge variant="secondary">VTT</Badge>
        {getDownloadStateIcon(subtitle.downloadState)}
      </div>
    </DownloadButton>
  );
};

export const DownloadSubtitleSelector: React.FC<{
  subtitles: TGetMovieSchemas["response"]["subtitles"];
}> = ({ subtitles }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Captions size={20} />
        <Typography>{t("movie.downloadPage.subtitles")}</Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        {subtitles.map((subtitle) => (
          <DownloadSubtitleButton key={subtitle.id} subtitle={subtitle} />
        ))}
      </div>
    </div>
  );
};

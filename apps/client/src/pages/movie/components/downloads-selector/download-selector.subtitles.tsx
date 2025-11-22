import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import type { TSubtitleSchema } from "@hypertube/libs";
import { Captions } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MoviePageParamsSchema } from "../../schemas/urlParams.schema";
import { DownloadButton } from "./download-selector.utils";

const DownloadSubtitleButton: React.FC<{
  subtitle: TSubtitleSchema;
}> = ({ subtitle }) => {
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);

  return (
    <DownloadButton
      downloadState={subtitle.downloadState}
      onClick={() => openDialog("downloadSubtitle", { tmdbId, subtitle })}
    >
      <Typography variant="small">{subtitle.language}</Typography>
      <div className="flex items-center justify-between w-full mt-2">
        <Badge variant="secondary">VTT</Badge>
        {getDownloadStateIcon(subtitle.downloadState)}
      </div>
    </DownloadButton>
  );
};

export const DownloadSubtitleSelector: React.FC<{
  subtitles: TSubtitleSchema[];
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
        {subtitles.length === 0 && (
          <Typography textColor="muted">
            {t("movie.downloadPage.noSubtitles")}
          </Typography>
        )}
      </div>
    </div>
  );
};

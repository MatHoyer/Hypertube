import { openDialog } from "@/components/dialogs/dialog.store";
import { getDownloadStateIcon } from "@/components/download-state/getDownloadStateIcon";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { type TResolutionSchema } from "@hypertube/libs";
import { Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MoviePageParamsSchema } from "../../schemas/urlParams.schema";
import { DownloadButton } from "./download-selector.utils";

const DownloadResolutionButton: React.FC<{
  resolution: TResolutionSchema;
}> = ({ resolution }) => {
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);

  return (
    <DownloadButton
      downloadState={resolution.downloadState}
      onClick={() => openDialog("downloadResolution", { tmdbId, resolution })}
    >
      <Typography textSize="sm" functionnal="truncate">
        {resolution.resolution}
      </Typography>
      <Typography textSize="xs" textColor="muted" functionnal="truncate">
        {resolution.size}
      </Typography>
      <div className="flex items-center justify-between w-full mt-2">
        <Badge variant="secondary">MP4</Badge>
        {getDownloadStateIcon(resolution.downloadState)}
      </div>
    </DownloadButton>
  );
};

export const DownloadResolutionSelector: React.FC<{
  resolutions: TResolutionSchema[];
}> = ({ resolutions }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Video size={20} />
        <Typography>{t("movie.downloadPage.resolutions")}</Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        {resolutions.map((resolution) => (
          <DownloadResolutionButton
            key={resolution.id}
            resolution={resolution}
          />
        ))}
        {resolutions.length === 0 && (
          <Typography textColor="muted">
            {t("movie.downloadPage.noResolutions")}
          </Typography>
        )}
      </div>
    </div>
  );
};

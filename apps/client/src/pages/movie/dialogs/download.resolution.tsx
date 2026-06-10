import { closeDialog } from "@/components/dialogs/dialog.store";
import { GlobalDialogFooter } from "@/components/dialogs/GlobalDialog.footer";
import { Badge } from "@/components/ui/badge";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import {
  DownloadStates,
  getUrl,
  postMovieDownloadResolutionSchemas,
  ROUTES,
  type TResolutionSchema,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DownloadResourceDisplay } from "./download.utils";

const ResolutionDisplay: React.FC<{
  resolution: TResolutionSchema;
}> = ({ resolution }) => {
  const { t } = useTranslation();

  return (
    <DownloadResourceDisplay>
      <div className="bg-accent p-4 rounded-md w-fit">
        <Video size={20} />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <Typography>{resolution.resolution}</Typography>
          <Badge variant="secondary">MP4</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Typography textSize="xs">
            {t("movie.downloadPage.downloadResolution.size")}:
          </Typography>
          <Typography textSize="xs">{resolution.size}</Typography>
        </div>
        <div className="flex items-center gap-2">
          <Typography textSize="xs">Indexer:</Typography>
          <Typography textSize="xs">{resolution.indexerName}</Typography>
        </div>
      </div>
    </DownloadResourceDisplay>
  );
};

export const DownloadResolutionDialog: React.FC<{
  tmdbId: number;
  resolution: TResolutionSchema;
}> = ({ tmdbId, resolution }) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.MOVIES, {
          tmdbId,
          resolutionId: resolution.id,
        }),
        schemas: postMovieDownloadResolutionSchemas,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_RESOLUTIONS, { tmdbId }),
      });
      closeDialog();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Download size={20} />
          {t("movie.downloadPage.downloadResolution.title")}
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
        {t("movie.downloadPage.downloadResolution.description.1")}
        <br />
        {t("movie.downloadPage.downloadResolution.description.2")}
      </DialogDescription>
      <ResolutionDisplay resolution={resolution} />
      <GlobalDialogFooter
        defaultSubmitButtonProps={{
          onClick: () => mutation.mutate(),
          loading: mutation.isPending,
          success: mutation.isSuccess,
          disabled: resolution.downloadState !== DownloadStates.NOT_DOWNLOADED,
          children: (
            <>
              <Download size={20} />
              {t("movie.downloadPage.downloadResolution.submit")}
            </>
          ),
        }}
      />
    </DialogContent>
  );
};

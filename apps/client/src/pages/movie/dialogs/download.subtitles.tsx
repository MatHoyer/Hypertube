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
  postMovieDownloadSubtitlesSchemas,
  ROUTES,
  type TSubtitleSchema,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Subtitles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DownloadResourceDisplay } from "./download.utils";

const SubtitleDisplay: React.FC<{
  subtitle: TSubtitleSchema;
}> = ({ subtitle }) => {
  return (
    <DownloadResourceDisplay>
      <Subtitles size={20} />
      <Typography>{subtitle.language}</Typography>
      <Badge variant="secondary">VTT</Badge>
    </DownloadResourceDisplay>
  );
};

export const DownloadSubtitleDialog: React.FC<{
  tmdbId: number;
  subtitle: TSubtitleSchema;
}> = ({ tmdbId, subtitle }) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      axiosFetch({
        method: "POST",
        url: getUrl(ROUTES.API.MOVIES, {
          tmdbId,
          subtitlesLanguage: subtitle.language,
        }),
        schemas: postMovieDownloadSubtitlesSchemas,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getQueryKey(ROUTES.API.MOVIES_SUBTITLES, { tmdbId }),
      });
      closeDialog();
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {t("movie.downloadPage.downloadSubtitle.title")}
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <Typography functionnal="wrap">
          {t("movie.downloadPage.downloadSubtitle.description.1")}
        </Typography>
        <Typography functionnal="wrap">
          {t("movie.downloadPage.downloadSubtitle.description.2")}
        </Typography>
      </DialogDescription>
      <SubtitleDisplay subtitle={subtitle} />
      <GlobalDialogFooter
        defaultSubmitButtonProps={{
          onClick: () => mutation.mutate(),
          loading: mutation.isPending,
          success: mutation.isSuccess,
          disabled: subtitle.downloadState !== DownloadStates.NOT_DOWNLOADED,
          children: t("movie.downloadPage.downloadSubtitle.submit"),
        }}
      />
    </DialogContent>
  );
};

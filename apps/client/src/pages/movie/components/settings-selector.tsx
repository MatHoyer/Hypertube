import { LoadingButton } from "@/components/LoadingButton";
import { AppLoader } from "@/components/ui/app-loader";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { cn } from "@/lib/utils";
import {
  DownloadStates,
  getUrl,
  languageCodes,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  ytsQualities,
  type DownloadState,
  type TGetMovieSchemas,
} from "@hypertube/libs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { VariantProps } from "class-variance-authority";
import { CheckIcon, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MoviePageParamsSchema } from "../schemas/urlParams.schema";

const DownloadButtonVariants: Record<
  DownloadState,
  VariantProps<typeof buttonVariants>["variant"]
> = {
  [DownloadStates.DOWNLOADED]: "success",
  [DownloadStates.DOWNLOADING]: "default",
  [DownloadStates.WAITING]: "outline",
  [DownloadStates.NOT_DOWNLOADED]: "outline",
};
const DownloadButton: React.FC<{
  label: string;
  downloadState: DownloadState;
  selected: boolean;
  onClick: () => void;
}> = ({ label, downloadState, selected, onClick }) => {
  const { t } = useTranslation();

  const variant = useMemo(
    () => DownloadButtonVariants[downloadState],
    [downloadState]
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-block">
          <Button
            onClick={onClick}
            variant={selected ? "default" : variant}
            disabled={downloadState !== DownloadStates.NOT_DOWNLOADED}
          >
            {downloadState === DownloadStates.DOWNLOADED && (
              <CheckIcon size={20} strokeWidth={3} />
            )}
            {downloadState === DownloadStates.DOWNLOADING && <AppLoader />}
            {downloadState === DownloadStates.WAITING && (
              <Clock size={20} strokeWidth={3} />
            )}
            <Typography>{label}</Typography>
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <Typography>
          {t(`movie.downloadPage.tooltip.${downloadState}`)}
        </Typography>
      </TooltipContent>
    </Tooltip>
  );
};

export const DownloadsSelector: React.FC<{
  resolutions: TGetMovieSchemas["response"]["resolutions"];
  subtitlesLanguages: TGetMovieSchemas["response"]["subtitles"];
}> = ({ resolutions, subtitlesLanguages }) => {
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const queryClient = useQueryClient();

  const { t } = useTranslation();
  const [selectedResolution, setSelectedResolution] = useState<string | null>(
    null
  );
  const [selectedSubtitlesLanguage, setSelectedSubtitlesLanguage] = useState<
    string | null
  >(null);

  const resolutionMutation = useMutation({
    mutationFn: (resolution: (typeof ytsQualities)[number]) => {
      return axiosFetch({
        method: "POST",
        url: getUrl("api-movies", {
          tmdbId,
          resolution,
        }),
        schemas: postMovieDownloadResolutionSchemas,
        handleEnding: {
          cb: () => {
            queryClient.invalidateQueries({ queryKey: ["movie", tmdbId] });
            setSelectedResolution(null);
          },
        },
      });
    },
  });

  const subtitlesMutation = useMutation({
    mutationFn: (subtitlesLanguage: keyof typeof languageCodes) => {
      return axiosFetch({
        method: "POST",
        url: getUrl("api-movies", {
          tmdbId,
          subtitlesLanguage,
        }),
        schemas: postMovieDownloadSubtitlesSchemas,
        handleEnding: {
          cb: () => {
            queryClient.invalidateQueries({ queryKey: ["movie", tmdbId] });
            setSelectedSubtitlesLanguage(null);
          },
        },
      });
    },
  });

  return (
    <Card className="w-full h-[72dvh]">
      <CardHeader>
        <CardTitle>{t("movie.downloadPage.title")}</CardTitle>
        <CardDescription>{t("movie.downloadPage.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("movie.downloadPage.resolutions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {resolutions.length > 0 ? (
              <div className="flex justify-start gap-2 flex-wrap">
                {resolutions.map((resolution, index) => (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <DownloadButton
                      label={resolution.resolution}
                      downloadState={resolution.downloadState}
                      selected={selectedResolution === resolution.resolution}
                      onClick={() =>
                        setSelectedResolution(resolution.resolution)
                      }
                    />
                    <Typography
                      variant="muted"
                      className={cn(
                        selectedResolution === resolution.resolution &&
                          "text-primary"
                      )}
                    >
                      {resolution.size}
                    </Typography>
                  </div>
                ))}
              </div>
            ) : (
              <Typography>{t("movie.downloadPage.noResolutions")}</Typography>
            )}
          </CardContent>
          <CardFooter>
            <LoadingButton
              disabled={!selectedResolution}
              loading={resolutionMutation.isPending}
              success={resolutionMutation.isSuccess}
              onClick={() =>
                resolutionMutation.mutate(
                  selectedResolution as (typeof ytsQualities)[number]
                )
              }
            >
              {t("movie.downloadPage.download")}
            </LoadingButton>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("movie.downloadPage.subtitles")}</CardTitle>
          </CardHeader>
          <CardContent>
            {subtitlesLanguages.length > 0 ? (
              <div className="flex justify-start gap-2 flex-wrap">
                {subtitlesLanguages.map((subtitlesLanguage, index) => (
                  <DownloadButton
                    key={index}
                    label={subtitlesLanguage.language}
                    downloadState={subtitlesLanguage.downloadState}
                    selected={
                      selectedSubtitlesLanguage === subtitlesLanguage.language
                    }
                    onClick={() =>
                      setSelectedSubtitlesLanguage(subtitlesLanguage.language)
                    }
                  />
                ))}
              </div>
            ) : (
              <Typography>{t("movie.downloadPage.noSubtitles")}</Typography>
            )}
          </CardContent>
          <CardFooter>
            <LoadingButton
              disabled={!selectedSubtitlesLanguage}
              loading={subtitlesMutation.isPending}
              success={subtitlesMutation.isSuccess}
              onClick={() =>
                subtitlesMutation.mutate(
                  selectedSubtitlesLanguage as keyof typeof languageCodes
                )
              }
            >
              {t("movie.downloadPage.download")}
            </LoadingButton>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

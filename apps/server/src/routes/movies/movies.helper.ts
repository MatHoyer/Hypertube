import {
  DownloadStates,
  hypertubeLogger,
  languageCodes,
  languageYTSCodes,
  TMovieSchema,
  TSubtitleSchema,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { YtsProxyApi } from "../../lib/apis/yts-proxy.api";
import { sendSSESubtitleStateChange, sseClients } from "./movie.sse";

export const downloadSubtitle = async ({
  subtitles,
  tmdbId,
}: {
  subtitles: TSubtitleSchema;
  tmdbId: TMovieSchema["tmdbId"];
}) => {
  await prisma.subtitle.update({
    where: {
      id: subtitles.id,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADING,
    },
  });

  const res = await new YtsProxyApi().downloadSubtitles({
    subtitles,
    tmdbId,
  });
  if (!res) {
    await prisma.subtitle.update({
      where: {
        id: subtitles.id,
      },
      data: {
        downloadState: DownloadStates.NOT_DOWNLOADED,
      },
    });
    hypertubeLogger.error(`Error downloading subtitles`);
    return { success: false };
  }

  await prisma.subtitle.update({
    where: {
      id: subtitles.id,
    },
    data: {
      downloadState: DownloadStates.DOWNLOADED,
    },
  });

  return { success: true };
};

export const downloadDefaultSubtitle = async ({
  subtitles,
  tmdbId,
  language,
}: {
  subtitles: TSubtitleSchema[];
  tmdbId: TMovieSchema["tmdbId"];
  language: keyof typeof languageCodes;
}) => {
  const defaultSubtitle = subtitles.find(
    (subtitle) => subtitle.language === languageYTSCodes[language]
  );

  if (defaultSubtitle?.downloadState === DownloadStates.NOT_DOWNLOADED) {
    const { success } = await downloadSubtitle({
      subtitles: defaultSubtitle!,
      tmdbId,
    });
    sseClients.mapClients(tmdbId.toString(), (stream) => {
      sendSSESubtitleStateChange(
        {
          id: defaultSubtitle.id,
          downloadState: success
            ? DownloadStates.DOWNLOADED
            : DownloadStates.NOT_DOWNLOADED,
        },
        stream
      );
    });
  }
};

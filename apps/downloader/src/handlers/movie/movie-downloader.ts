import {
  DownloadStates,
  formatUnknownError,
  hypertubeLogger,
  TMovieSchema,
} from "@hypertube/libs";
import {
  BUCKETS,
  getStoragePath,
  prisma,
  TDownloadJobData,
  waitFile,
} from "@hypertube/server-core";
import { Job } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import { PassThrough } from "node:stream";
import { buffer } from "node:stream/consumers";
import path from "path";
import { storageService } from "../../main.js";
import { notifySubscribers } from "../../notifications/notifySubscriber.js";
import {
  convertSubtitleFileToVtt,
  FFPROBE_LOW_MEM,
  formatSidecarSubtitleLanguage,
  handleEmbeddedSubtitles,
  isSidecarSubtitle,
} from "./download-torrent-subtitles.js";
import { downloader, TransmissionTorrent } from "./transmission.client.js";

const WAIT_FILE_TIMEOUT = 1000000;
const WAIT_SUBTITLE_TIMEOUT = 10000;
const CHECK_DOWNLOAD_INTERVAL = 30000;
const COMPLETE_THRESHOLD = 0.99;

const Status = {
  STOPPED: 0,
  CHECK_WAIT: 1,
  CHECKING: 2,
  DOWNLOAD_WAIT: 3,
  DOWNLOADING: 4,
  SEED_WAIT: 5,
  SEEDING: 6,
} as const;

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mkv",
  ".avi",
  ".m4v",
  ".webm",
  ".mov",
  ".wmv",
  ".flv",
  ".ts",
  ".m2ts",
];

type TorrentFile = { name: string; length?: number };

const probeVideoMetadata = (filePath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, FFPROBE_LOW_MEM, (err, metadata) => {
      if (err) {
        reject(
          new Error(
            `Failed to probe video metadata: ${formatUnknownError(err)}`
          )
        );
        return;
      }

      const duration = metadata?.format?.duration;
      if (
        typeof duration !== "number" ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        reject(
          new Error(`Invalid or missing video duration: ${String(duration)}`)
        );
        return;
      }

      const videoStream = metadata.streams?.find(
        (stream) => stream.codec_type === "video"
      );
      const audioStream = metadata.streams?.find(
        (stream) => stream.codec_type === "audio"
      );
      const bitrate = metadata.format?.bit_rate;

      resolve({
        duration,
        videoCodec: videoStream?.codec_name,
        audioCodec: audioStream?.codec_name,
        width: videoStream?.width,
        height: videoStream?.height,
        bitrate:
          typeof bitrate === "string"
            ? Number.parseInt(bitrate, 10)
            : typeof bitrate === "number"
              ? bitrate
              : undefined,
        formatName: metadata.format?.format_name,
      });
    });
  });
};

const buildMovieObjectMetadata = ({
  videoMetadata,
  movie,
  resolutionId,
  resolution,
  sourceFilename,
  sourceSizeBytes,
}: {
  videoMetadata: VideoMetadata;
  movie: TMovieSchema;
  resolutionId: string;
  resolution: {
    resolution: string;
    indexerName: string;
    infoHash: string | null;
  };
  sourceFilename: string;
  sourceSizeBytes: number;
}): Record<string, string> => {
  const metadata: Record<string, string> = {
    "Content-Type": "video/mp4",
    duration: videoMetadata.duration.toFixed(3),
    "tmdb-id": String(movie.tmdbId),
    "resolution-id": resolutionId,
    resolution: resolution.resolution,
    "indexer-name": resolution.indexerName,
    "source-filename": sourceFilename,
    "source-size-bytes": String(sourceSizeBytes),
  };

  if (movie.imdbId) {
    metadata["imdb-id"] = movie.imdbId;
  }
  if (resolution.infoHash) {
    metadata["info-hash"] = resolution.infoHash;
  }
  if (videoMetadata.videoCodec) {
    metadata["video-codec"] = videoMetadata.videoCodec;
  }
  if (videoMetadata.audioCodec) {
    metadata["audio-codec"] = videoMetadata.audioCodec;
  }
  if (videoMetadata.width) {
    metadata.width = String(videoMetadata.width);
  }
  if (videoMetadata.height) {
    metadata.height = String(videoMetadata.height);
  }
  if (videoMetadata.bitrate) {
    metadata["bitrate-bps"] = String(videoMetadata.bitrate);
  }
  if (videoMetadata.formatName) {
    metadata["source-format"] = videoMetadata.formatName;
  }

  return metadata;
};

const isVideoFile = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

const isTorrentComplete = (torrent: TransmissionTorrent): boolean =>
  torrent.percentDone >= COMPLETE_THRESHOLD ||
  torrent.status === Status.SEEDING;

const isTorrentStalled = (torrent: TransmissionTorrent): boolean =>
  torrent.status === Status.STOPPED && torrent.percentDone < COMPLETE_THRESHOLD;

const findMainVideoFile = (files: TorrentFile[]): TorrentFile | undefined => {
  const videoFiles = files.filter((file) => isVideoFile(file.name));
  if (videoFiles.length === 0) return undefined;
  if (videoFiles.length === 1) return videoFiles[0];

  return videoFiles.reduce((largest, file) =>
    (file.length ?? 0) > (largest.length ?? 0) ? file : largest
  );
};

const convertMovie = (
  input: { path: string },
  output: PassThrough,
  handler?: {
    onStart?: () => Promise<void>;
    onProgress?: (progress: { percent: number }) => Promise<void>;
    onEnd?: () => Promise<void>;
    onError?: (error: Error) => Promise<void>;
  }
): Promise<void> => {
  return new Promise((resolvePromise, rejectPromise) => {
    const run = async () => {
      ffmpeg(input.path)
        .inputOptions([
          "-fflags",
          "+genpts",
          "-threads",
          "1",
          ...FFPROBE_LOW_MEM,
        ])
        .outputOptions([
          "-map",
          "0:v:0",
          "-map",
          "0:a:0?",
          "-c",
          "copy",
          "-threads",
          "1",
          "-max_muxing_queue_size",
          "256",
          "-movflags",
          "frag_keyframe+empty_moov+default_base_moof",
        ])
        .format("mp4")
        .on("start", async (commandLine) => {
          hypertubeLogger.info(`Conversion started: ${commandLine}`);
          await handler?.onStart?.();
        })
        .on("progress", async (progress) => {
          hypertubeLogger.info(
            `Conversion progress: ${progress.percent?.toFixed(2) || 0}%`
          );
          await handler?.onProgress?.({ percent: progress.percent || 0 });
        })
        .on("end", async () => {
          hypertubeLogger.info(`Conversion ended`);
          await handler?.onEnd?.();
          resolvePromise();
        })
        .on("error", async (error) => {
          hypertubeLogger.error(
            `Conversion error: ${formatUnknownError(error)}`
          );
          await handler?.onError?.(error);
          rejectPromise(
            error instanceof Error ? error : new Error(String(error))
          );
        })
        .pipe(output, { end: true });
    };

    void run();
  });
};

const uploadSubtitle = async ({
  movie,
  language,
  vttStream,
  downloadLink,
}: {
  movie: TMovieSchema;
  language: string;
  vttStream: PassThrough;
  downloadLink: string;
}) => {
  await storageService.putObject(
    BUCKETS.MOVIES,
    getStoragePath(
      movie.tmdbId.toString(),
      "subtitles",
      language,
      "subtitles.vtt"
    ),
    vttStream
  );

  await prisma.subtitle.upsert({
    where: { downloadLink },
    update: {},
    create: {
      movieId: movie.id,
      language,
      rating: 5,
      downloadLink,
      downloadState: DownloadStates.DOWNLOADED,
    },
  });
};

const handleSidecarSubtitleFile = async (
  movie: TMovieSchema,
  subtitleFile: { name: string }
) => {
  const target = path.resolve(
    process.cwd(),
    `./downloads-transmission/incomplete/${subtitleFile.name}`
  );
  hypertubeLogger.info(
    `Waiting for sidecar subtitle file to be downloaded ${target}`
  );
  await waitFile(target, WAIT_SUBTITLE_TIMEOUT);

  const language = formatSidecarSubtitleLanguage(subtitleFile.name);
  const uploadStream = new PassThrough();

  hypertubeLogger.info(
    `Converting sidecar subtitle to VTT: ${subtitleFile.name}`
  );
  await Promise.all([
    convertSubtitleFileToVtt(target, uploadStream),
    uploadSubtitle({
      movie,
      language,
      vttStream: uploadStream,
      downloadLink: subtitleFile.name,
    }),
  ]);
};

export const downloadMovie = async (job: Job<TDownloadJobData>) => {
  const { movie, resolutionId } = job.data;

  const dbResolution = await prisma.resolution.findUnique({
    where: { id: resolutionId },
  });
  if (!dbResolution) {
    throw new Error(`Resolution ${resolutionId} not found`);
  }

  const resolutionStream = await storageService.getObject(
    BUCKETS.MOVIES,
    getStoragePath(
      movie.tmdbId.toString(),
      "resolutions",
      resolutionId,
      "resolution.torrent"
    )
  );
  const torrentBuf = await buffer(resolutionStream);
  const isMagnet = torrentBuf.toString("utf-8").startsWith("magnet:");

  const downloadDir = `/downloads-transmission/${movie.tmdbId}/resolutions/${resolutionId}`;
  await fs.promises.mkdir(downloadDir, { recursive: true });
  hypertubeLogger.info(
    `Adding ${isMagnet ? "magnet" : "torrent"} for movie ${movie.tmdbId} resolution ${dbResolution.resolution} (${dbResolution.indexerName})`
  );

  const addOptions = { "download-dir": downloadDir, paused: true };
  const result = isMagnet
    ? await downloader.addMagnet(torrentBuf.toString("utf-8"), addOptions)
    : await downloader.addTorrentMetainfo(torrentBuf, addOptions);
  hypertubeLogger.info(`Torrent added with ID: ${result.id}`);

  try {
    let files: { name: string }[];
    if (isMagnet) {
      hypertubeLogger.info("Waiting for magnet metadata");
      await downloader.start(result.id);
      files = await downloader.waitForFiles(result.id);
    } else {
      const info = await downloader.get(result.id, ["files"]);
      files = info.torrents[0].files as { name: string }[];
    }

    const videoFile = findMainVideoFile(files);
    if (!videoFile) {
      throw new Error(
        `Video file not found (supported: ${VIDEO_EXTENSIONS.join(", ")})`
      );
    }
    hypertubeLogger.info(`Video file found ${videoFile.name}`);
    const sidecarSubtitleFiles = files.filter((file) =>
      isSidecarSubtitle(file.name)
    );
    if (sidecarSubtitleFiles.length > 0) {
      hypertubeLogger.info(
        `${sidecarSubtitleFiles.length} sidecar subtitle file(s) found ${sidecarSubtitleFiles
          .map((file) => file.name)
          .join(", ")}`
      );
    }

    if (!isMagnet) {
      await downloader.start(result.id);
    }

    const target = `/downloads-transmission/incomplete/${videoFile.name}`;

    hypertubeLogger.info(`Waiting for torrent download to start (${target})`);
    await downloader.waitForDownloadProgress(result.id);

    try {
      const sidecarPromises = sidecarSubtitleFiles.map((subtitleFile) =>
        handleSidecarSubtitleFile(movie, subtitleFile)
      );
      await Promise.allSettled(sidecarPromises);
    } catch (error) {
      hypertubeLogger.error(
        `Error handling sidecar subtitle files: ${formatUnknownError(error)}`
      );
    }

    await prisma.resolution.update({
      where: {
        id: resolutionId,
      },
      data: { downloadState: DownloadStates.DOWNLOADING },
    });
    notifySubscribers(movie.id, DownloadStates.DOWNLOADING);
    hypertubeLogger.info(`Movie downloaded started successfully`);

    return new Promise<void>((resolve, reject) => {
      const intervalId = setInterval(async () => {
        try {
          hypertubeLogger.info("Checking torrent status");
          const res = await downloader.get(result.id);
          const torrent = res.torrents[0];
          if (!torrent) {
            clearInterval(intervalId);
            reject(new Error("Torrent not found"));
            return;
          }
          hypertubeLogger.info(`Torrent found: ${torrent.name}`);

          const name = torrent.name;
          const percentDone = torrent.percentDone * 100;
          const downloadSpeed = torrent.rateDownload / 1024; // Ko/s
          const status = torrent.status;

          hypertubeLogger.info(`Status: ${status}`);
          hypertubeLogger.info(
            `Name: ${name}, Percent done: ${percentDone.toFixed(
              2
            )}, Download speed: ${downloadSpeed.toFixed(2)}, Status: ${status}`
          );

          if (isTorrentStalled(torrent)) {
            clearInterval(intervalId);
            reject(
              new Error(
                `Torrent stalled at ${(torrent.percentDone * 100).toFixed(2)}% (${torrent.errorString ?? "no error"})`
              )
            );
            return;
          }

          if (isTorrentComplete(torrent)) {
            clearInterval(intervalId);

            const endFile = downloadDir + "/" + videoFile.name;
            await waitFile(endFile, WAIT_FILE_TIMEOUT);

            const endFileStat = await fs.promises.stat(endFile);
            if (endFileStat.size === 0) {
              reject(new Error(`Downloaded file is empty: ${endFile}`));
              return;
            }

            try {
              const movieObjectPath = getStoragePath(
                movie.tmdbId.toString(),
                "resolutions",
                resolutionId,
                "movie.mp4"
              );
              const videoMetadata = await probeVideoMetadata(endFile);
              const movieMetadata = buildMovieObjectMetadata({
                videoMetadata,
                movie,
                resolutionId,
                resolution: dbResolution,
                sourceFilename: videoFile.name,
                sourceSizeBytes: endFileStat.size,
              });
              hypertubeLogger.info(
                `Uploading movie with metadata: duration=${movieMetadata.duration}s, resolution=${movieMetadata.resolution}`
              );
              const uploadStream = new PassThrough();

              await Promise.all([
                convertMovie({ path: endFile }, uploadStream),
                storageService.putObject(
                  BUCKETS.MOVIES,
                  movieObjectPath,
                  uploadStream,
                  undefined,
                  movieMetadata
                ),
                Promise.allSettled([
                  handleEmbeddedSubtitles({
                    videoPath: endFile,
                    videoFileName: videoFile.name,
                    onSubtitle: async ({
                      language,
                      vttStream,
                      downloadLink,
                    }) => {
                      await uploadSubtitle({
                        movie,
                        language,
                        vttStream,
                        downloadLink,
                      });
                    },
                  }),
                ]),
              ]);

              const uploadedStat = await storageService.statObject(
                BUCKETS.MOVIES,
                movieObjectPath
              );
              if (uploadedStat.size === 0) {
                throw new Error(
                  `Uploaded movie file is empty: ${movieObjectPath}`
                );
              }

              resolve();
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
            return;
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(
            new Error(`Error in ending download: ${formatUnknownError(error)}`)
          );
        }
      }, CHECK_DOWNLOAD_INTERVAL);
    });
  } catch (error) {
    await downloader.remove(result.id);
    throw error instanceof Error ? error : new Error(formatUnknownError(error));
  }
};

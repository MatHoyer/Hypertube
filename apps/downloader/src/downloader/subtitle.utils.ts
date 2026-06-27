import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import { PassThrough } from "node:stream";
import * as path from "path";

export const FFPROBE_LOW_MEM = [
  "-probesize",
  "2097152",
  "-analyzeduration",
  "1000000",
];

export const SIDECAR_SUBTITLE_EXTENSIONS = [".srt", ".ass", ".ssa"];

export type SubtitleStream = {
  index: number;
  codecName: string;
  language: string;
  title?: string;
};

export const isSidecarSubtitle = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return SIDECAR_SUBTITLE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

export const probeSubtitleStreams = (
  filePath: string
): Promise<SubtitleStream[]> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, FFPROBE_LOW_MEM, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const streams =
        metadata?.streams?.filter((stream) => stream.codec_type === "subtitle") ??
        [];

      resolve(
        streams.map((stream) => ({
          index: stream.index ?? 0,
          codecName: stream.codec_name ?? "unknown",
          language: stream.tags?.language ?? "",
          title: stream.tags?.title,
        }))
      );
    });
  });
};

export const extractEmbeddedSubtitleToVtt = (
  videoPath: string,
  streamIndex: number,
  output: PassThrough
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions(["-map", `0:${streamIndex}`, "-c:s", "webvtt"])
      .format("webvtt")
      .on("end", () => resolve())
      .on("error", (error) => reject(error))
      .pipe(output, { end: true });
  });
};

export const convertSubtitleFileToVtt = (
  inputPath: string,
  output: PassThrough
): Promise<void> => {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === ".srt") {
    return convertSrtFileToVtt(inputPath, output);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(["-c:s", "webvtt"])
      .format("webvtt")
      .on("end", () => resolve())
      .on("error", (error) => reject(error))
      .pipe(output, { end: true });
  });
};

const convertSrtFileToVtt = async (
  srtPath: string,
  output: PassThrough
): Promise<void> => {
  const srtData = await fs.promises.readFile(srtPath, "utf8");
  let vttData =
    "WEBVTT\n\n" + srtData.replace(/(\d+:\d+:\d+),(\d+)/g, "$1.$2");
  vttData = vttData.replace(/^\d+\s*[\r\n]+/gm, "");
  output.end(vttData);
};

export const formatEmbeddedSubtitleLanguage = (
  stream: SubtitleStream,
  trackNumber: number
): string => {
  const label = stream.title || stream.language || `Track ${trackNumber}`;
  return `Embedded - ${label}`;
};

export const formatSidecarSubtitleLanguage = (filename: string): string => {
  const basename = filename.substring(
    filename.lastIndexOf("/") + 1,
    filename.lastIndexOf(".")
  );
  if (basename.includes("[YTS.MX]")) {
    return "YTS OFFICIAL - English";
  }
  return `Torrent - ${basename}`;
};

export const handleEmbeddedSubtitles = async ({
  videoPath,
  videoFileName,
  onSubtitle,
}: {
  videoPath: string;
  videoFileName: string;
  onSubtitle: (params: {
    language: string;
    vttStream: PassThrough;
    downloadLink: string;
  }) => Promise<void>;
}): Promise<void> => {
  const streams = await probeSubtitleStreams(videoPath);
  if (streams.length === 0) {
    hypertubeLogger.info(`No embedded subtitles in ${videoFileName}`);
    return;
  }

  hypertubeLogger.info(
    `${streams.length} embedded subtitle stream(s) found in ${videoFileName}`
  );

  for (const [i, stream] of streams.entries()) {
    const language = formatEmbeddedSubtitleLanguage(stream, i + 1);
    const downloadLink = `embedded:${videoFileName}:s:${stream.index}`;
    const uploadStream = new PassThrough();

    try {
      await Promise.all([
        extractEmbeddedSubtitleToVtt(videoPath, stream.index, uploadStream),
        onSubtitle({ language, vttStream: uploadStream, downloadLink }),
      ]);
      hypertubeLogger.info(
        `Embedded subtitle extracted: ${language} (${stream.codecName})`
      );
    } catch (error) {
      hypertubeLogger.error(
        `Failed to extract embedded subtitle ${language}: ${formatUnknownError(error)}`
      );
    }
  }
};

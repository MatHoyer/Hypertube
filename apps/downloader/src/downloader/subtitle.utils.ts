import { formatUnknownError, hypertubeLogger } from "@hypertube/libs";
import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
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
  outputPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputPath)
      .outputOptions(["-map", `0:${streamIndex}`, "-c:s", "webvtt"])
      .on("end", () => resolve())
      .on("error", (error) => reject(error))
      .run();
  });
};

export const convertSubtitleFileToVtt = (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === ".srt") {
    return convertSrtFileToVtt(inputPath, outputPath);
  }

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .outputOptions(["-c:s", "webvtt"])
      .on("end", () => resolve())
      .on("error", (error) => reject(error))
      .run();
  });
};

const convertSrtFileToVtt = async (
  srtPath: string,
  vttPath: string
): Promise<void> => {
  const srtData = await fs.promises.readFile(srtPath, "utf8");
  let vttData =
    "WEBVTT\n\n" + srtData.replace(/(\d+:\d+:\d+),(\d+)/g, "$1.$2");
  vttData = vttData.replace(/^\d+\s*[\r\n]+/gm, "");
  await fs.promises.writeFile(vttPath, vttData, { encoding: "utf8", flag: "w" });
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
  subtitlesDir,
  onSubtitle,
}: {
  videoPath: string;
  videoFileName: string;
  subtitlesDir: string;
  onSubtitle: (params: {
    language: string;
    vttPath: string;
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

  await fs.promises.mkdir(subtitlesDir, { recursive: true });

  for (const [i, stream] of streams.entries()) {
    const language = formatEmbeddedSubtitleLanguage(stream, i + 1);
    const safeLanguage = language.replace(/[/\\]/g, "-");
    const subtitleDir = path.join(subtitlesDir, safeLanguage);
    const vttPath = path.join(subtitleDir, "subtitles.vtt");
    const downloadLink = `embedded:${videoFileName}:s:${stream.index}`;

    try {
      await fs.promises.mkdir(subtitleDir, { recursive: true });
      await extractEmbeddedSubtitleToVtt(videoPath, stream.index, vttPath);
      await onSubtitle({ language, vttPath, downloadLink });
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

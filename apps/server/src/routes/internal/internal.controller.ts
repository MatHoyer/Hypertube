import { DownloadStates } from "@hypertube/libs";
import { Context } from "hono";
import prisma from "../../lib/prisma";
import { TBodyParser } from "../../middlewares/bodyParser";

export const movieDownloadJobStarted = async (
  c: Context<
    TBodyParser<{ movieId: string; resolution: string; success: boolean }>
  >
) => {
  const { movieId, resolution, success } = c.get("validatedBody");
  await prisma.resolution.update({
    where: {
      movieId_resolution: { movieId, resolution },
    },
    data: {
      downloadState: success
        ? DownloadStates.DOWNLOADING
        : DownloadStates.NOT_DOWNLOADED,
    },
  });
  console.log(
    `Movie download job started, ${movieId}, ${resolution}, ${success}`
  );
  return c.json({ message: `OK` });
};

export const movieDownloadJobEnd = async (
  c: Context<
    TBodyParser<{ movieId: string; resolution: string; success: boolean }>
  >
) => {
  const { movieId, resolution, success } = c.get("validatedBody");
  await prisma.resolution.update({
    where: {
      movieId_resolution: { movieId, resolution },
    },
    data: {
      downloadState: success
        ? DownloadStates.DOWNLOADED
        : DownloadStates.NOT_DOWNLOADED,
    },
  });
  console.log(
    `Movie download job ended, ${movieId}, ${resolution}, ${success}`
  );
  return c.json({
    message: `OK`,
  });
};

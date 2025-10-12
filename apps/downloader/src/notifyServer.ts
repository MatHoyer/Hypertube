import { getUrl, hypertubeLogger } from "@hypertube/libs";
import { env } from "./env.js";

const notifyServer = async ({
  type,
  movieId,
  resolution,
  success,
}: {
  type: "started" | "ended";
  movieId: string;
  resolution: string;
  success: boolean;
}) => {
  const response = await fetch(
    getUrl(
      type === "started"
        ? "internal-movie-download-job-started"
        : "internal-movie-download-job-end",
      {
        withServerUrl: true,
      }
    ),
    {
      method: "POST",
      body: JSON.stringify({ movieId, resolution, success }),
      headers: {
        "Content-Type": "application/json",
        Authorization: env.INTERNAL_TOKEN,
      },
    }
  );

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

const successNotifyServer = async ({
  type,
  movieId,
  resolution,
}: {
  type: "started" | "ended";
  movieId: string;
  resolution: string;
}) => {
  try {
    await notifyServer({ type, movieId, resolution, success: true });
  } catch (error) {
    hypertubeLogger.error(
      `[${movieId}] Failed to notify server : ${JSON.stringify(error)}`
    );
  }
};

const failedNotifyServer = async ({
  type,
  movieId,
  resolution,
}: {
  type: "started" | "ended";
  movieId: string;
  resolution: string;
}) => {
  try {
    await notifyServer({ type, movieId, resolution, success: false });
  } catch (error) {
    hypertubeLogger.error(
      `[${movieId}] Failed to notify server : ${JSON.stringify(error)}`
    );
  }
};

export { failedNotifyServer, notifyServer, successNotifyServer };

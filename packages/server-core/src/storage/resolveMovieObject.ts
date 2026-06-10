import { BUCKETS, getLegacyMoviePath, getMoviePath } from "./const.js";
import { minio } from "./minio.js";

const isObjectNotFound = (e: unknown): boolean => {
  if (e == null || typeof e !== "object") return false;
  const err = e as { code?: string; statusCode?: number };
  return (
    err.code === "NotFound" ||
    err.code === "NoSuchKey" ||
    err.statusCode === 404
  );
};

export const resolveMovieObjectName = async (
  movieId: string,
  resolutionId: string,
  quality: string | undefined,
  filename: string
): Promise<string> => {
  const primary = getMoviePath(movieId, resolutionId, filename);
  try {
    await minio.statObject(BUCKETS.MOVIES, primary);
    return primary;
  } catch (e) {
    if (!isObjectNotFound(e) || !quality) throw e;
    const legacy = getLegacyMoviePath(movieId, quality, filename);
    await minio.statObject(BUCKETS.MOVIES, legacy);
    return legacy;
  }
};

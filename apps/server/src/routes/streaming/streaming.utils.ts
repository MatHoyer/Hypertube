export const isObjectNotFound = (e: unknown): boolean => {
  if (e == null || typeof e !== "object") return false;
  const err = e as { code?: string; statusCode?: number };
  return (
    err.code === "NotFound" ||
    err.code === "NoSuchKey" ||
    err.statusCode === 404
  );
};

export type ParsedByteRange = {
  start: number;
  end: number;
  chunkSize: number;
  safeEnd: number;
};

export const parseByteRange = (
  range: string,
  fileSize: number,
  defaultChunkSize = 5_000_000
): ParsedByteRange | { unsatisfiable: true } => {
  const [rawStart, rawEnd] = range.replace(/bytes=/, "").split("-");
  const start = parseInt(rawStart, 10);
  const end = rawEnd ? parseInt(rawEnd, 10) : start + defaultChunkSize;

  if (start >= fileSize) {
    return { unsatisfiable: true };
  }

  const safeEnd = Math.min(end, fileSize - 1);
  const chunkSize = safeEnd - start + 1;

  return { start, end, chunkSize, safeEnd };
};

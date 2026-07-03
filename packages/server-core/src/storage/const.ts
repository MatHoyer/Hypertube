export const BUCKETS = {
  MOVIES: "movies",
  IMAGES: "images",
};

type TItemType = "resolutions" | "subtitles";

type TFilename<T extends TItemType> = T extends "resolutions"
  ? "movie.mp4" | "resolution.torrent"
  : "subtitles.vtt";

export const getStoragePath = <T extends TItemType>(
  movieId: string,
  itemType: T,
  itemId: string,
  filename: TFilename<T>
) => {
  return `${movieId}/${itemType}/${itemId}/${filename}`;
};

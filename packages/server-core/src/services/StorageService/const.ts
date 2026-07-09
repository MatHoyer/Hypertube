export const BUCKETS = {
  MOVIES: "movies",
  IMAGES: "images",
} as const;

export type TBuckets = (typeof BUCKETS)[keyof typeof BUCKETS];

type TItemFilenames = {
  resolutions: "movie.mp4" | "resolution.torrent";
  subtitles: "subtitles.vtt";
};

type TItemType = keyof TItemFilenames;
type TFilename<T extends TItemType> = TItemFilenames[T];

export const getStoragePath = <T extends TItemType>(
  movieId: string,
  itemType: T,
  itemId: string,
  filename: TFilename<T>
) => {
  return `${movieId}/${itemType}/${itemId}/${filename}`;
};

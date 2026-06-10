export const BUCKETS = {
  MOVIES: "movies",
  SUBTITLES: "subtitles",
  IMAGES: "images",
};

export const getMovieRootPath = (movieId: string) => {
  return `${movieId}`;
};
export const getMoviePath = (
  movieId: string,
  resolutionId: string,
  filename: string
) => {
  return `${getMovieRootPath(movieId)}/resolutions/${resolutionId}/${filename}`;
};

/** Pre-migration layout keyed by quality label (e.g. 1080p). */
export const getLegacyMoviePath = (
  movieId: string,
  quality: string,
  filename: string
) => {
  return `${getMovieRootPath(movieId)}/resolutions/${quality}/${filename}`;
};

export const getSubtitleRootPath = (movieId: string) => {
  return `${movieId}`;
};
export const getSubtitlePath = (
  movieId: string,
  language: string,
  filename: string
) => {
  return `${getSubtitleRootPath(movieId)}/${language}/${filename}`;
};

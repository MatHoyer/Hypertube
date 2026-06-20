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

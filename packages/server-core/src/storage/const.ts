export const BUCKETS = {
  MOVIES: "movies",
  SUBTITLES: "subtitles",
};

export const getMovieRootPath = (movieId: string) => {
  return `${movieId}`;
};
export const getMoviePath = (
  movieId: string,
  resolution: string,
  filename: string
) => {
  return `${getMovieRootPath(movieId)}/resolutions/${resolution}/${filename}`;
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

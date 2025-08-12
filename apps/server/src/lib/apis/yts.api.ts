import { capitalizeAllWords } from "@hypertube/libs";
import z from "zod";

// https://yts.mx/api for documentation

const ytsApiUrl = "https://yts.mx/api/v2/";

const responseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    status: z.string(),
    status_message: z.string(),
    data: dataSchema,
  });

const ytsQualities = [
  "480p",
  "720p",
  "1080p",
  "1080p.x265",
  "2160p",
  "3D",
] as const;

const ytsGenres = [
  "action",
  "adventure",
  "animation",
  "biography",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "family",
  "fantasy",
  "film-noir",
  "game-show",
  "history",
  "horror",
  "music",
  "musical",
  "mystery",
  "news",
  "reality-tv",
  "romance",
  "sci-fi",
  "short",
  "sport",
  "talk-show",
  "thriller",
  "war",
  "western",
] as const;

const ytsSortBy = [
  "title",
  "year",
  "rating",
  "peers",
  "seeds",
  "download_count",
  "like_count",
  "date_added",
] as const;

const ytsMoviesSearchParamsSchema = z.object({
  limit: z.number().optional(),
  page: z.number().int().positive().optional(),
  quality: z.enum(ytsQualities).optional(),
  minimum_rating: z.number().int().positive().min(0).max(9).optional(),
  query_term: z.string().optional(),
  genre: z.enum(ytsGenres).optional(),
  sort_by: z.enum(ytsSortBy).optional(),
  order_by: z.enum(["desc", "asc"]).optional(),
  with_rt_ratings: z.boolean().optional(),
});
type TYtsMoviesSearchParams = z.infer<typeof ytsMoviesSearchParamsSchema>;

const ytsMovieTorrentSchema = z.object({
  url: z.string(),
  hash: z.string(),
  quality: z.enum(ytsQualities),
  size: z.string(),
});

const ytsMovieSchema = z.object({
  id: z.number(),
  url: z.url(),
  imdb_code: z.string(),
  title_english: z.string(),
  title_long: z.string(),
  slug: z.string().refine((slug) => !slug.includes(" "), {
    message: "Slug must not contain spaces",
  }),
  year: z.number(),
  rating: z.number(),
  runtime: z.number(),
  genres: z.array(
    z.enum(ytsGenres.map((genre) => capitalizeAllWords(genre, "-")))
  ),
  yt_trailer_code: z.url().optional(),
  language: z.string(),
  background_image: z.string(),
  small_cover_image: z.string(),
  medium_cover_image: z.string(),
  large_cover_image: z.string(),
  torrents: z.array(ytsMovieTorrentSchema),
});

const ytsGetMoviesResponseSchema = z.object({
  movie_count: z.number(),
  limit: z.number(),
  page_number: z.number(),
  movies: z.array(ytsMovieSchema),
});

export const getMovies = async (params: TYtsMoviesSearchParams = {}) => {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, value.toString()])
  );
  const searchParams = new URLSearchParams(stringParams);
  const url = `${ytsApiUrl}/list_movies.json${
    searchParams ? `?${searchParams}` : ""
  }`;

  console.log(url);
  const response = await fetch(url);
  const data = await response.json();

  return responseSchema(ytsGetMoviesResponseSchema).parse(data).data.movies;
};

export const getMovieByLongTitle = async (title: string, year: number) => {
  const movies = await getMovies({
    query_term: `${title} (${year})`,
    limit: 1,
  });

  if (movies.length === 0) {
    throw new Error(`Movie ${title} (${year}) not found`);
  }

  return movies[0];
};

const ytsMovieDetailsResponseSchema = z.object({
  movie: ytsMovieSchema,
});

export const getMovieByImdbId = async (imdbId: string) => {
  const searchParams = new URLSearchParams({
    imdb_id: imdbId,
  });
  const url = `${ytsApiUrl}/movie_details.json?${searchParams}`;

  const response = await fetch(url);
  const data = await response.json();

  return responseSchema(ytsMovieDetailsResponseSchema).parse(data).data.movie;
};

export const getResolutionsForMovie = async (imdbId: string) => {
  const movie = await getMovieByImdbId(imdbId);

  return movie.torrents;
};

export const getResolutionForMovie = async (
  imdbId: string,
  resolution: string
) => {
  const movie = await getMovieByImdbId(imdbId);

  const torrent = movie.torrents.find(
    (torrent) => torrent.quality === resolution
  );

  if (!torrent) {
    throw new Error(`Resolution ${resolution} not found for movie ${imdbId}`);
  }

  return torrent;
};

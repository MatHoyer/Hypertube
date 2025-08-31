import {
  capitalizeAllWords,
  convertObjectToSearchParams,
  ytsApiSortBy,
  ytsGenres,
  ytsQualities,
} from "@hypertube/libs";
import { writeFile } from "fs/promises";
import z from "zod";

import {
  createResolution,
  getResolutionPath,
} from "../movie-folder-gestion/resolution";
import prisma from "../prisma";

// https://yts.mx/api for documentation

const ytsApiUrl = "https://yts.mx/api/v2/";

const responseSchema = <T>(dataSchema: z.ZodSchema<T>) =>
  z.object({
    status: z.string(),
    status_message: z.string(),
    data: dataSchema,
  });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ytsMoviesSearchParamsSchema = z.object({
  limit: z.number().optional(),
  page: z.number().int().positive().optional(),
  quality: z.enum(ytsQualities).optional(),
  minimum_rating: z.number().int().positive().min(0).max(9).optional(),
  query_term: z.string().optional(),
  genre: z.enum(ytsGenres).optional(),
  sort_by: z.enum(ytsApiSortBy).optional(),
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

const ytsMovieActorSchema = z.object({
  name: z.string(),
  character_name: z.string().optional(),
  imdb_code: z.string(),
  url_small_image: z.string().optional(),
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
  description_full: z.string().optional(),
  yt_trailer_code: z.string().optional(),
  language: z.string(),
  background_image: z.string(),
  small_cover_image: z.string(),
  medium_cover_image: z.string(),
  large_cover_image: z.string(),
  torrents: z.array(ytsMovieTorrentSchema),
  cast: z.array(ytsMovieActorSchema).optional().default([]),
});

const ytsGetMoviesResponseSchema = z.object({
  movie_count: z.number(),
  limit: z.number(),
  page_number: z.number(),
  movies: z.array(ytsMovieSchema.omit({ cast: true })),
});

export const getMovies = async (params: TYtsMoviesSearchParams = {}) => {
  const searchParams = convertObjectToSearchParams(params);
  const url = `${ytsApiUrl}/list_movies.json${
    searchParams ? `?${searchParams}` : ""
  }`;

  const response = await fetch(url);
  const data = await response.json();

  const parsedData = responseSchema(ytsGetMoviesResponseSchema).safeParse(data);
  if (!parsedData.success) {
    return [];
  }

  return parsedData.data.data.movies;
};

export const getMovieByLongTitle = async (title: string, year: number) => {
  const movies = await getMovies({
    query_term: `${title} (${year})`,
    limit: 1,
  });

  if (movies.length === 0) {
    return null;
  }

  return movies[0];
};

const ytsMovieDetailsResponseSchema = z.object({
  movie: ytsMovieSchema,
});

export const getMovieByImdbId = async (imdbId: string) => {
  const params = {
    imdb_id: imdbId,
    with_cast: true,
  };
  const searchParams = convertObjectToSearchParams(params);
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

export const downloadResolution = async (movie: {
  id: string;
  imdbId: string;
  resolution: string;
}) => {
  try {
    const resolutionData = await getResolutionForMovie(
      movie.imdbId,
      movie.resolution
    );

    const res = await fetch(resolutionData.url);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await createResolution(movie.id, movie.resolution);

    await prisma.resolution.upsert({
      where: {
        movieId_resolution: {
          movieId: movie.id,
          resolution: movie.resolution,
        },
      },
      create: {
        movieId: movie.id,
        resolution: movie.resolution,
        size: resolutionData.size,
        downloadState: "DOWNLOADING",
      },
      update: {
        size: resolutionData.size,
        downloadState: "DOWNLOADING",
      },
    });

    const outputPath = getResolutionPath(movie.id, movie.resolution, true);
    await writeFile(outputPath, buffer);

    await prisma.resolution.upsert({
      where: {
        movieId_resolution: {
          movieId: movie.id,
          resolution: movie.resolution,
        },
      },
      create: {
        movieId: movie.id,
        resolution: movie.resolution,
        size: resolutionData.size,
        downloadState: "DOWNLOADED",
      },
      update: {
        size: resolutionData.size,
        downloadState: "DOWNLOADED",
      },
    });
  } catch (error) {
    await prisma.resolution.upsert({
      where: {
        movieId_resolution: {
          movieId: movie.id,
          resolution: movie.resolution,
        },
      },
      create: {
        movieId: movie.id,
        resolution: movie.resolution,
        size: "0B",
        downloadState: "NOT_DOWNLOADED",
      },
      update: {
        downloadState: "NOT_DOWNLOADED",
      },
    });
    console.error(error);
  }
};

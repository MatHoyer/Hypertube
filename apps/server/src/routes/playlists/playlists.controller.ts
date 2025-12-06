import {
  DownloadStates,
  getPlaylistSchemas,
  languageCodes,
  TDeleteMovieFromPlaylistSchemas,
  TDeletePlaylistSchemas,
  TGetPlaylistSchemas,
  TPostMovieToPlaylistSchemas,
  TPostPlaylistSchemas,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { TmdbApi } from "../../lib/apis/tmdb.api";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { getMovieDownloadStatesByTmdbIds } from "../global/movie.global";

export const getPlaylists = async (c: Context<TIsLogged>) => {
  const user = c.get("user");

  const playlists = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      playlists: {
        include: {
          movies: { include: { movie: { select: { tmdbId: true } } } },
        },
      },
    },
  });
  if (!playlists) return c.json({ playlists: [] }, 200);

  const playlistsWithFlatMovies = playlists.playlists.map((playlist) => {
    return {
      ...playlist,
      movies: playlist.movies.map((movie) => {
        const { movie: tmdbMovie, ...movieWithoutTmdbMovie } = movie;
        return { ...movieWithoutTmdbMovie, tmdbId: tmdbMovie.tmdbId };
      }),
    };
  });

  return c.json({ playlists: playlistsWithFlatMovies }, 200);
};

export const getPlaylist = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TGetPlaylistSchemas["urlParams"]> &
      TSearchParamsParser<TGetPlaylistSchemas["searchParams"]>
  >
) => {
  const user = c.get("user");
  const language = c.get("language");
  const { playlistId } = c.get("validatedUrlParams");
  const { page, pageSize } = c.get("validatedSearchParams");

  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
  });
  if (!playlist) return c.json([], 404);
  if (user.id !== playlist.userId) return c.json([], 401);

  const movies = await prisma.playlistMovie.findMany({
    where: { playlistId: playlist.id },
    include: { movie: true },
    orderBy: {
      updatedAt: "asc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const totalCount = await prisma.playlistMovie.count({
    where: { playlistId: playlist.id },
  });

  const movieDownloadStatesByTmdbIds = await getMovieDownloadStatesByTmdbIds(
    movies.map(({ movie }) => movie.tmdbId)
  );

  const tmdbApi = new TmdbApi();
  const tmdbMovies = await tmdbApi.getAllMovieDetails(
    movies.map(({ movie }) => movie.tmdbId),
    language as keyof typeof languageCodes
  );

  return c.json(
    getPlaylistSchemas.response.parse({
      movies: tmdbMovies.map((tmdbMovie) => ({
        details: tmdbMovie,
        downloadState:
          movieDownloadStatesByTmdbIds.get(tmdbMovie.id) ??
          DownloadStates.NOT_DOWNLOADED,
      })),
      totalCount,
    }),
    200
  );
};

export const postPlaylist = async (
  c: Context<TIsLogged & TBodyParser<TPostPlaylistSchemas["requirements"]>>
) => {
  const { playlistName } = c.get("validatedBody");
  const user = c.get("user");

  const findPlaylist = await prisma.playlist.findUnique({
    where: { name_userId: { name: playlistName, userId: user.id } },
  });
  if (findPlaylist) {
    return c.json({ message: "Already have a playlist with this name" }, 409);
  }

  await prisma.playlist.create({
    data: { name: playlistName, userId: user.id },
  });

  return c.json({ message: "OK" }, 200);
};

export const deletePlaylist = async (
  c: Context<TIsLogged & TUrlParamsParser<TDeletePlaylistSchemas["urlParams"]>>
) => {
  const { playlistId } = c.get("validatedUrlParams");
  const user = c.get("user");

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId },
  });
  if (!playlist) return c.json({ message: "Playlist not found" }, 404);
  if (playlist.userId != user.id) {
    return c.json({ message: "Not your playlist" }, 401);
  }

  await prisma.playlist.delete({
    where: { name_userId: { name: playlist.name, userId: user.id } },
  });

  return c.json({ message: "OK" }, 200);
};

export const postMovieToPlaylist = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPostMovieToPlaylistSchemas["urlParams"]> &
      TBodyParser<TPostMovieToPlaylistSchemas["requirements"]>
  >
) => {
  const { playlistId } = c.get("validatedUrlParams");
  const { tmdbId } = c.get("validatedBody");
  const user = c.get("user");
  const language = c.get("language");

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId },
  });
  if (!playlist) return c.json({ message: "Playlist not found" }, 404);
  if (playlist.userId != user.id) {
    return c.json({ message: "Not your playlist" }, 401);
  }

  let movie = await prisma.movie.findFirst({ where: { tmdbId } });
  if (!movie) {
    const tmdbApi = new TmdbApi();
    const tmdbMovie = await tmdbApi.getMovie(
      tmdbId,
      language as keyof typeof languageCodes
    );
    if (!tmdbMovie.hasDetails) {
      return c.json({ message: "Movie not found" }, 404);
    }

    movie = await prisma.movie.create({
      data: {
        tmdbId,
        imdbId: tmdbMovie.imdb_id,
      },
    });
  }

  const findMovie = await prisma.playlistMovie.findUnique({
    where: { playlistId_movieId: { playlistId, movieId: movie.id } },
  });
  if (findMovie) return c.json({ message: "Movie already in playlist" }, 409);

  await prisma.playlistMovie.create({
    data: { playlistId, movieId: movie.id },
  });

  return c.json({ message: "OK" }, 200);
};

export const deleteMovieFromPlaylist = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteMovieFromPlaylistSchemas["urlParams"]>
  >
) => {
  const { playlistId, tmdbId } = c.get("validatedUrlParams");
  const user = c.get("user");

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId },
  });
  if (!playlist) return c.json({ message: "Playlist not found" }, 404);
  if (playlist.userId != user.id) {
    return c.json({ message: "Not your playlist" }, 401);
  }

  const movie = await prisma.movie.findFirst({ where: { tmdbId } });
  if (!movie) return c.json({ message: "Movie not found" }, 404);

  try {
    await prisma.playlistMovie.delete({
      where: { playlistId_movieId: { playlistId, movieId: movie.id } },
    });

    return c.json({ message: "OK" }, 200);
  } catch {
    return c.json({ message: "Movie was not in playlist" }, 404);
  }
};

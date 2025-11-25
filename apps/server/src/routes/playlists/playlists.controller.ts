import {
  TDeleteMovieToPlaylistSchemas,
  TDeletePlaylistSchemas,
  TPostMovieToPlaylistSchemas,
  TPostPlaylistSchemas,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getPlaylists = async (c: Context<TIsLogged>) => {
  const user = c.get("user");

  const playlists = await prisma.user.findUnique({
    where: { id: user.id },
    select: { playlists: { include: { movies: true } } },
  });

  return c.json({ playlists: playlists?.playlists ?? [] }, 200);
};

export const postPlaylist = async (
  c: Context<TIsLogged & TBodyParser<TPostPlaylistSchemas["requirements"]>>
) => {
  const { playlistName } = c.get("validatedBody");
  const user = c.get("user");

  try {
    await prisma.playlist.create({
      data: { name: playlistName, userId: user.id },
    });

    return c.json({ message: "OK" }, 200);
  } catch {
    return c.json({ message: "Already have a playlist with this name" }, 400);
  }
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
  const { movieId } = c.get("validatedBody");
  const user = c.get("user");

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId },
  });
  if (!playlist) return c.json({ message: "Playlist not found" }, 404);
  if (playlist.userId != user.id) {
    return c.json({ message: "Not your playlist" }, 401);
  }

  const movie = await prisma.movie.findFirst({ where: { id: movieId } });
  if (!movie) return c.json({ message: "Movie not found" }, 404);

  try {
    await prisma.playlistMovie.create({
      data: { playlistId, movieId },
    });

    return c.json({ message: "OK" }, 200);
  } catch {
    return c.json({ message: "Movie already in playlist" }, 404);
  }
};

export const deleteMovieToPlaylist = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TDeleteMovieToPlaylistSchemas["urlParams"]>
  >
) => {
  const { playlistId, movieId } = c.get("validatedUrlParams");
  const user = c.get("user");

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId },
  });
  if (!playlist) return c.json({ message: "Playlist not found" }, 404);
  if (playlist.userId != user.id) {
    return c.json({ message: "Not your playlist" }, 401);
  }

  const movie = await prisma.movie.findFirst({ where: { id: movieId } });
  if (!movie) return c.json({ message: "Movie not found" }, 404);

  try {
    await prisma.playlistMovie.delete({
      where: { playlistId_movieId: { playlistId, movieId } },
    });

    return c.json({ message: "OK" }, 200);
  } catch {
    return c.json({ message: "Movie was not in playlist" }, 404);
  }
};

import type { TTestSchemas } from "@hypertube/libs";
import type { Context } from "hono";
import { createMovie } from "../../lib/movie-folder-gestion/movie";
import { createResolution } from "../../lib/movie-folder-gestion/resolution";
import { createSubtitle } from "../../lib/movie-folder-gestion/subtitle";
import prisma from "../../lib/prisma";
import type { TBodyParser } from "../../middlewares/bodyParser";
import type { TUrlParamsParser } from "../../middlewares/urlParamsParser";

export const getPrisma = async (c: Context) => {
  const profile = await prisma.profile.findFirst();
  return c.json(profile);
};

export const postPrisma = async (c: Context) => {
  await prisma.profile.create({});
  return c.text("Created");
};

export const postTest = async (
  c: Context<
    TUrlParamsParser<TTestSchemas["requirements"]> &
      TBodyParser<TTestSchemas["requirements"]>
  >
) => {
  const body = c.get("validatedBody");
  const urlParams = c.get("validatedUrlParams");
  return c.json({
    id: `${urlParams.id}+${body.id}`,
  });
};

export const movieTest = async (c: Context) => {
  const movie = await createMovie({
    title: "test",
    description: "test",
    imageUrl: "test",
  });
  await createResolution({
    Movie: {
      connect: {
        id: movie.id,
      },
    },
    resolution: "1080p",
    size: "1000",
  });
  await createSubtitle({
    Movie: {
      connect: {
        id: movie.id,
      },
    },
    language: "en",
  });
  return c.json(movie);
};

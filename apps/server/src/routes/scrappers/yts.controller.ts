import type {
  TGetYtsDownloadResolutionSchemas,
  TGetYtsDownloadSubtitlesSchemas,
  TGetYtsMovieDataSchemas,
  TGetYtsPaginationSchemas,
} from "@hypertube/libs";
import {
  DownloadStates,
  getYtsMovieDataSchemas,
  getYtsPaginationSchemas,
  type TGetYtsMoviesSchemas,
} from "@hypertube/libs";
import type { Context } from "hono";
import {
  downloadResolution,
  getMovieByImdbId,
  getMovieByLongTitle,
} from "../../lib/apis/yts.api.js";
import { downloadMovie } from "../../lib/downloader/downloadMovie.js";
import prisma from "../../lib/prisma.js";
import {
  downloadSubtitles,
  getSubtitlesDownloadLinks,
} from "../../lib/scrappers/yifysubtitles.scrapper.js";
import {
  scrapeYtsFilters,
  scrapeYtsMovies,
  scrapeYtsPagination,
} from "../../lib/scrappers/yts.scrapper.js";
import type { TSearchParamsParser } from "../../middlewares/searchParamsParser.js";
import type { TUrlParamsParser } from "../../middlewares/urlParamsParser.js";

export const getYtsFilters = async (c: Context) => {
  const filters = await scrapeYtsFilters();

  return c.json(filters);
};

export const getYtsPagination = async (
  c: Context<TSearchParamsParser<TGetYtsPaginationSchemas["searchParams"]>>
) => {
  const { page, ...rest } = c.get("validatedSearchParams");

  const maxPagination = await scrapeYtsPagination(rest, page);

  return c.json(getYtsPaginationSchemas.response.parse({ maxPagination }));
};

export const getYtsMovies = async (
  c: Context<TSearchParamsParser<TGetYtsMoviesSchemas["searchParams"]>>
) => {
  const { page, ...rest } = c.get("validatedSearchParams");

  const movies = await scrapeYtsMovies(rest, page);

  const movieData = (
    await Promise.all(
      movies.map(
        async (movie) => await getMovieByLongTitle(movie.title, movie.year)
      )
    )
  ).filter((movie) => movie !== null);

  const dbMovies = await Promise.all(
    movieData.map(
      async (movie) =>
        await prisma.movie.upsert({
          where: {
            imdbId: movie.imdb_code,
          },
          update: {
            title: movie.title_english,
            year: movie.year,
            rating: movie.rating,
            genres: movie.genres,
            language: movie.language,
            backgroundImageUrl: movie.background_image,
            smallCoverImageUrl: movie.small_cover_image,
            mediumCoverImageUrl: movie.medium_cover_image,
            largeCoverImageUrl: movie.large_cover_image,
            ytTrailerCode: movie.yt_trailer_code,
          },
          create: {
            imdbId: movie.imdb_code,
            title: movie.title_english,
            year: movie.year,
            rating: movie.rating,
            genres: movie.genres,
            language: movie.language,
            backgroundImageUrl: movie.background_image,
            smallCoverImageUrl: movie.small_cover_image,
            mediumCoverImageUrl: movie.medium_cover_image,
            largeCoverImageUrl: movie.large_cover_image,
            ytTrailerCode: movie.yt_trailer_code,
          },
        })
    )
  );

  return c.json(dbMovies);
};

const fetchAdditionalInfo = async (movieId: string) => {
  let movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
  });
  if (!movie) {
    return null;
  }

  const movieData = await getMovieByImdbId(movie.imdbId);

  movie = await prisma.movie.update({
    where: {
      id: movie.id,
    },
    data: {
      description: movieData.description_full,
    },
  });

  const actors = await Promise.all(
    movieData.cast.map(async (actor) => {
      return await prisma.actor.upsert({
        where: { imdbId: actor.imdb_code },
        update: {
          name: actor.name,
          imageUrl: actor.url_small_image,
        },
        create: {
          imdbId: actor.imdb_code,
          name: actor.name,
          imageUrl: actor.url_small_image,
        },
      });
    })
  );

  const resolvedActors = movieData.cast
    .map((actor) => {
      const dbActor = actors.find(
        (dbActor) => dbActor.imdbId === actor.imdb_code
      );
      if (!dbActor) return null;

      return {
        ...dbActor,
        characterName: actor.character_name,
      };
    })
    .filter((actor) => actor !== null);

  await Promise.all(
    resolvedActors.map(async (actor) => {
      return await prisma.movieActor.upsert({
        where: {
          movieId_actorId: { movieId: movie.id, actorId: actor.id },
        },
        update: {
          characterName: actor.characterName,
        },
        create: {
          movieId: movie.id,
          actorId: actor.id,
          characterName: actor.characterName,
        },
      });
    })
  );

  const resolutionsData = movieData.torrents;

  const resolutions = await Promise.all(
    resolutionsData.map(async (resolution) => {
      return await prisma.resolution.upsert({
        where: {
          movieId_resolution: {
            movieId: movie.id,
            resolution: resolution.quality,
          },
        },
        create: {
          movieId: movie.id,
          resolution: resolution.quality,
          size: resolution.size,
          downloadState: DownloadStates.NOT_DOWNLOADED,
        },
        update: {
          size: resolution.size,
        },
      });
    })
  );

  const subtitlesData = await getSubtitlesDownloadLinks({
    imdbId: movie.imdbId,
  });

  const subtitles = await Promise.all(
    subtitlesData.map(
      async (subtitle) =>
        await prisma.subtitle.upsert({
          where: { downloadLink: subtitle.link },
          update: {
            language: subtitle.language,
            rating: subtitle.rating,
          },
          create: {
            downloadLink: subtitle.link,
            language: subtitle.language,
            rating: subtitle.rating,
            movieId: movie.id,
          },
        })
    )
  );

  const dbResolutions = await prisma.resolution.findMany({
    where: {
      movieId: movie.id,
    },
  });

  const dbSubtitles = await prisma.subtitle.findMany({
    where: {
      movieId: movie.id,
    },
  });

  await prisma.movie.update({
    where: {
      id: movie.id,
    },
    data: {
      additionalInfoFetched: true,
    },
  });

  return {
    ...movie,
    resolutions: resolutions.map((resolution) => {
      const dbResolution = dbResolutions.find(
        (dbResolution) => dbResolution.resolution === resolution.resolution
      );

      return (
        dbResolution ?? {
          resolution: resolution.resolution,
          size: resolution.size,
          downloadState: DownloadStates.NOT_DOWNLOADED,
        }
      );
    }),
    actors: resolvedActors,
    subtitles: subtitles.map((subtitle) => {
      const dbSubtitle = dbSubtitles.find(
        (dbSubtitle) => dbSubtitle.language === subtitle.language
      );

      return (
        dbSubtitle ?? {
          ...subtitle,
          downloadState: DownloadStates.NOT_DOWNLOADED,
        }
      );
    }),
  };
};

export const getYtsMovieData = async (
  c: Context<TUrlParamsParser<TGetYtsMovieDataSchemas["urlParams"]>>
) => {
  const { id } = c.get("validatedUrlParams");
  const movie = await prisma.movie.findUnique({
    where: {
      id,
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  if (movie.additionalInfoFetched) {
    const dbResolutions = await prisma.resolution.findMany({
      where: {
        movieId: movie.id,
      },
    });

    const dbSubtitles = await prisma.subtitle.findMany({
      where: {
        movieId: movie.id,
      },
    });

    const dbActors = await prisma.actor.findMany({
      where: {
        movies: {
          some: {
            movieId: movie.id,
          },
        },
      },
    });

    fetchAdditionalInfo(movie.id);

    return c.json(
      getYtsMovieDataSchemas.response.parse({
        ...movie,
        resolutions: dbResolutions,
        subtitles: dbSubtitles,
        actors: dbActors,
      })
    );
  }

  const updatedMovie = await fetchAdditionalInfo(movie.id);

  return c.json(getYtsMovieDataSchemas.response.parse(updatedMovie));
};

export const getYtsDownloadResolution = async (
  c: Context<TUrlParamsParser<TGetYtsDownloadResolutionSchemas["urlParams"]>>
) => {
  const { movieId, resolution } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    include: {
      resolutions: {
        where: {
          resolution,
        },
      },
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  try {
    downloadResolution({
      id: movie.id,
      imdbId: movie.imdbId,
      resolution: resolution,
    });
  } catch (error) {
    console.error(error);
  }

  await downloadMovie(movie.id, resolution);

  return c.json({ message: "Resolution downloading" });
};

export const getYtsDownloadSubtitles = async (
  c: Context<TUrlParamsParser<TGetYtsDownloadSubtitlesSchemas["urlParams"]>>
) => {
  const { movieId, subtitlesLanguage } = c.get("validatedUrlParams");

  const movie = await prisma.movie.findUnique({
    where: {
      id: movieId,
    },
    include: {
      subtitles: {
        where: {
          language: subtitlesLanguage,
        },
        orderBy: {
          rating: "desc",
        },
      },
    },
  });
  if (!movie) {
    return c.json({ error: "Movie not found" }, 404);
  }

  try {
    downloadSubtitles({
      ...movie.subtitles[0],
      movieId: movie.id,
      downloadState: movie.subtitles[0].downloadState,
    });
  } catch (error) {
    console.error(error);
  }

  return c.json({ message: "Subtitles downloading" });
};

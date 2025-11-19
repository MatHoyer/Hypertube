import {
  getMovieSchemas,
  getMoviesSchemas,
  getUrl,
  ROUTES,
} from "@hypertube/libs";

export const moviesSwagger = {
  [getUrl(ROUTES.API.MOVIES)]: {
    get: {
      summary: "Get movies",
      tags: ["Movies"],
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "name",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.name,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getMoviesSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES, { tmdbId: "{tmdbId}" })]: {
    get: {
      summary: "Get movie",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: getMovieSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getMovieSchemas.response,
            },
          },
        },
      },
    },
  },
};

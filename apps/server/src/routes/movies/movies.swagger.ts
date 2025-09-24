import { getMovieSchemas, getMoviesSchemas, getUrl } from "@hypertube/libs";

export const moviesSwagger = {
  [getUrl("api-movies")]: {
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
  [getUrl("api-movies", { movieId: "{movieId}" })]: {
    get: {
      summary: "Get movie",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "movieId",
          required: true,
          schema: getMovieSchemas.urlParams.shape.movieId,
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

import {
  getMovieSchemas,
  getMoviesSchemas,
  getUrl,
  ROUTES,
  tmdbCategories,
  tmdbGenres,
  tmdbSorts,
} from "@hypertube/libs";

export const moviesSwagger = {
  [getUrl(ROUTES.API.MOVIES)]: {
    get: {
      summary: "Get movies",
      tags: ["Movies"],
      description:
        "Category filters and search queries are independent - categories ans queries are not applied when using Sort options or Genre filters",
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "query",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.query,
        },
        {
          in: "query",
          name: "category",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.category,
          description: `Category : ${tmdbCategories
            .map((category) => category)
            .join(" / ")}`,
        },
        {
          in: "query",
          name: "sort",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.sort,
          description: `Sort : ${tmdbSorts.map((sort) => sort).join(" / ")}`,
        },
        {
          in: "query",
          name: "genres",
          required: false,
          schema: getMoviesSchemas.searchParams.shape.genres,
          description: `Genres : ${Object.keys(tmdbGenres)
            .map((genre) => genre)
            .join(" / ")}`,
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

import {
  deleteMovieLikeSchemas,
  getMovieCastingSchema,
  getMovieCommentSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getUrl,
  postMovieCommentSchemas,
  postMovieLikeSchemas,
  putMovieWatchTimerSchemas,
  ROUTES,
  tmdbGenres,
  typedKeys,
  typedValues,
} from "@hypertube/libs";

const tmdbIdPathParam = {
  in: "path",
  name: "tmdbId",
  required: true,
  schema: getMovieSchemas.urlParams.shape.tmdbId,
};

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
          schema: {
            type: "string",
            enum: typedValues(
              getMoviesSchemas.searchParams.shape.category.unwrap().enum
            ),
          },
        },
        {
          in: "query",
          name: "sort",
          required: false,
          schema: {
            type: "string",
            enum: typedValues(
              getMoviesSchemas.searchParams.shape.sort.unwrap().enum
            ),
          },
        },
        {
          in: "query",
          name: "genres",
          required: false,
          schema: {
            type: "array",
            items: {
              type: "string",
              enum: typedKeys(tmdbGenres),
            },
          },
          style: "form",
          explode: false,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              example: {
                movies: [
                  {
                    id: 550,
                    imdb_id: "tt0137523",
                    original_title: "Fight Club",
                    original_language: "en",
                    title: "Fight Club",
                    overview:
                      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
                    genres: [
                      {
                        id: 18,
                        name: "Drama",
                      },
                      {
                        id: 53,
                        name: "Thriller",
                      },
                    ],
                    vote_average: 8.4,
                    vote_count: 27500,
                    popularity: 85.3,
                    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                    backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
                    release_date: "1999-10-15",
                    adult: false,
                    status: "DOWNLOADED",
                  },
                  {
                    id: 155,
                    imdb_id: "tt0468569",
                    original_title: "The Dark Knight",
                    original_language: "en",
                    title: "The Dark Knight",
                    overview:
                      "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
                    genres: [
                      {
                        id: 28,
                        name: "Action",
                      },
                      {
                        id: 80,
                        name: "Crime",
                      },
                      {
                        id: 18,
                        name: "Drama",
                      },
                    ],
                    vote_average: 9.0,
                    vote_count: 31200,
                    popularity: 120.5,
                    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                    backdrop_path: "/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
                    release_date: "2008-07-18",
                    adult: false,
                    status: "NOT_DOWNLOADED",
                  },
                  null,
                ],
                page: 12,
                pageSize: 20,
                total: 835,
                totalPages: 42,
              },
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
  [getUrl(ROUTES.API.MOVIES_LIKE, { tmdbId: "{tmdbId}" })]: {
    post: {
      summary: "Like a movie",
      tags: ["Movies"],
      parameters: [tmdbIdPathParam],
      responses: {
        "201": {
          description: "Created",
          content: {
            "application/json": {
              schema: postMovieLikeSchemas.response,
            },
          },
        },
        "400": {
          description: "Error on like movie",
        },
      },
    },
    delete: {
      summary: "Dislike a movie",
      tags: ["Movies"],
      parameters: [tmdbIdPathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: deleteMovieLikeSchemas.response,
            },
          },
        },
        "400": {
          description: "Error on dislike a movie",
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES_COMMENT, { tmdbId: "{tmdbId}" })]: {
    get: {
      summary: "Get movie comments",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: getMovieCommentSchemas.urlParams.shape.tmdbId,
        },
        {
          in: "query",
          name: "page",
          required: false,
          schema: getMovieCommentSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getMovieCommentSchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getMovieCommentSchemas.response,
            },
          },
        },
      },
    },
    post: {
      summary: "Post a comment",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: postMovieCommentSchemas.urlParams.shape.tmdbId,
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: postMovieCommentSchemas.requirements,
          },
        },
      },
      responses: {
        "201": {
          description: "Created",
          content: {
            "application/json": {
              schema: postMovieCommentSchemas.response,
            },
          },
        },
        "400": { description: "Error creating comment " },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES_WATCH_TIMER, { tmdbId: "{tmdbId}" })]: {
    put: {
      summary: "Update movie watch timer",
      tags: ["Movies"],
      parameters: [tmdbIdPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: putMovieWatchTimerSchemas.requirements,
          },
        },
      },
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: putMovieWatchTimerSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES_CASTING, { tmdbId: "{tmdbId}" })]: {
    get: {
      summary: "Get movie casting",
      tags: ["Movies"],
      parameters: [tmdbIdPathParam],
      responses: {
        "200": {
          description: "Movie casting got get successfully",
          content: {
            "application/json": {
              schema: getMovieCastingSchema.response,
            },
          },
        },
      },
    },
  },
};

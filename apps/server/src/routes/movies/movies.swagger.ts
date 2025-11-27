import {
  deleteMovieCommentSchemas,
  deleteMovieLikeSchemas,
  getMovieCommentSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getUrl,
  postMovieCommentSchemas,
  postMovieLikeSchemas,
  putMovieWatchTimerSchemas,
  ROUTES,
  tmdbCategories,
  tmdbGenres,
  tmdbSorts,
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
  [getUrl(ROUTES.API.MOVIES_COMMENT, {
    tmdbId: "{tmdbId}",
    commentId: "{commentId}",
  })]: {
    delete: {
      summary: "Delete a movie comment",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: deleteMovieCommentSchemas.urlParams.shape.tmdbId,
        },
        {
          in: "path",
          name: "commentId",
          required: true,
          schema: deleteMovieCommentSchemas.urlParams.shape.commentId,
        },
      ],
      responses: {
        "200": {
          description: "Comment deleted",
          content: {
            "application/json": {
              schema: deleteMovieCommentSchemas.response,
            },
          },
        },
        "400": { description: "Error deleting comment" },
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
};

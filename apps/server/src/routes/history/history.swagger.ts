import {
  deleteHistorySchemas,
  deleteMovieFromHistorySchemas,
  getHistorySchemas,
  getUrl,
  ROUTES,
} from "@hypertube/libs";

export const historySwagger = {
  [getUrl(ROUTES.API.HISTORY)]: {
    get: {
      summary: "Get user's watch history",
      tags: ["History"],
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getHistorySchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getHistorySchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getHistorySchemas.response,
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete all history",
      tags: ["History"],
      responses: {
        "200": {
          description: "History deleted",
          content: {
            "application/json": {
              schema: deleteHistorySchemas.response,
            },
          },
        },
        "400": {
          description: "Error deleting history",
        },
      },
    },
  },
  [getUrl(ROUTES.API.HISTORY, { tmdbId: "{tmdbId}" })]: {
    delete: {
      summary: "Delete a movie from history",
      tags: ["History"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: deleteMovieFromHistorySchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie removed from history",
          content: {
            "application/json": {
              schema: deleteMovieFromHistorySchemas.response,
            },
          },
        },
        "400": {
          description: "Error deleting movie from history",
        },
      },
    },
  },
};

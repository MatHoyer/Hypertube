import {
  deleteMovieFromPlaylistSchemas,
  deletePlaylistSchemas,
  getPlaylistSchemas,
  getPlaylistsSchemas,
  getUrl,
  postMovieToPlaylistSchemas,
  postPlaylistSchemas,
  ROUTES,
} from "@hypertube/libs";

export const playlistsSwagger = {
  [getUrl(ROUTES.API.PLAYLISTS)]: {
    get: {
      summary: "Get user's playlists",
      tags: ["Playlists"],
      responses: {
        "200": {
          description: "Playlists got get successfully",
          content: {
            "application/json": {
              schema: getPlaylistsSchemas.response,
            },
          },
        },
      },
    },
    post: {
      summary: "Create user's playlist",
      tags: ["Playlists"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: postPlaylistSchemas.requirements,
            example: {
              playlistName: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "User's playlist successfully created",
          content: {
            "application/json": {
              schema: postPlaylistSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.PLAYLISTS, { playlistId: "{playlistId}" })]: {
    get: {
      summary: "Get user's playlist",
      tags: ["Playlists"],
      parameters: [
        {
          in: "path",
          name: "playlistId",
          required: true,
          schema: getPlaylistSchemas.urlParams.shape.playlistId,
        },
        {
          in: "query",
          name: "page",
          required: false,
          schema: getPlaylistSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getPlaylistSchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "User's playlist got get successfully",
          content: {
            "application/json": {
              schema: getPlaylistSchemas.response,
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete user's playlist",
      tags: ["Playlists"],
      parameters: [
        {
          in: "path",
          name: "playlistId",
          required: true,
          schema: deletePlaylistSchemas.urlParams.shape.playlistId,
        },
      ],
      responses: {
        "200": {
          description: "User's playlist get successfully deleted",
          content: {
            "application/json": {
              schema: deletePlaylistSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.PLAYLISTS_MOVIE, { playlistId: "{playlistId}" })]: {
    post: {
      summary: "Add movie to user's playlist",
      tags: ["Playlists"],
      parameters: [
        {
          in: "path",
          name: "playlistId",
          required: true,
          schema: postMovieToPlaylistSchemas.urlParams.shape.playlistId,
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: postMovieToPlaylistSchemas.requirements,
            example: {
              tmdbId: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Movie get successfully added to user's playlist",
          content: {
            "application/json": {
              schema: postMovieToPlaylistSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.PLAYLISTS_MOVIE, {
    playlistId: "{playlistId}",
    tmdbId: "{tmdbId}",
  })]: {
    delete: {
      summary: "Delete movie to user's playlist",
      tags: ["Playlists"],
      parameters: [
        {
          in: "path",
          name: "playlistId",
          required: true,
          schema: deleteMovieFromPlaylistSchemas.urlParams.shape.playlistId,
        },
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: deleteMovieFromPlaylistSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie get successfully deleted of user's playlist",
          content: {
            "application/json": {
              schema: deleteMovieFromPlaylistSchemas.response,
            },
          },
        },
      },
    },
  },
};

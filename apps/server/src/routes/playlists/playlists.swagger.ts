import {
  deleteMovieToPlaylistSchemas,
  deletePlaylistSchemas,
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
    delete: {
      summary: "Delete user's playlists",
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
              movieId: "",
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
    movieId: "{movieId}",
  })]: {
    delete: {
      summary: "Delete movie to user's playlist",
      tags: ["Playlists"],
      parameters: [
        {
          in: "path",
          name: "playlistId",
          required: true,
          schema: deleteMovieToPlaylistSchemas.urlParams.shape.playlistId,
        },
        {
          in: "path",
          name: "movieId",
          required: true,
          schema: deleteMovieToPlaylistSchemas.urlParams.shape.movieId,
        },
      ],
      responses: {
        "200": {
          description: "Movie get successfully deleted of user's playlist",
          content: {
            "application/json": {
              schema: deleteMovieToPlaylistSchemas.response,
            },
          },
        },
      },
    },
  },
};

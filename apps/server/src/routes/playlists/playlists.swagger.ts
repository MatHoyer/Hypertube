import {
  deletePlaylistSchemas,
  getPlaylistsSchemas,
  getUrl,
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
};

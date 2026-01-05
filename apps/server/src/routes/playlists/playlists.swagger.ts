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
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getPlaylistsSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getPlaylistsSchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "Playlists got get successfully",
          content: {
            "application/json": {
              example: {
                playlists: [
                  {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "My Favorite Action Movies",
                    userId: "user123",
                    createdAt: "2025-12-15T10:30:00Z",
                    updatedAt: "2026-01-03T14:20:00Z",
                    movies: [
                      {
                        id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
                        playlistId: "550e8400-e29b-41d4-a716-446655440000",
                        movieId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                        tmdbId: 155,
                        createdAt: "2025-12-15T10:35:00Z",
                        updatedAt: "2025-12-15T10:35:00Z",
                      },
                      {
                        id: "8d0f7780-8536-51ef-a55c-f18gd2g01bf8",
                        playlistId: "550e8400-e29b-41d4-a716-446655440000",
                        movieId: "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
                        tmdbId: 680,
                        createdAt: "2025-12-20T16:45:00Z",
                        updatedAt: "2025-12-20T16:45:00Z",
                      },
                    ],
                  },
                  {
                    id: "2h4j1124-2970-95ij-e99g-j52kh6k45fj2",
                    name: "Classic Movies",
                    userId: "user123",
                    createdAt: "2025-11-10T12:00:00Z",
                    updatedAt: "2025-11-10T12:00:00Z",
                    movies: [],
                  },
                ],
                page: 1,
                pageSize: 2,
                total: 5,
                totalPages: 3,
              },
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

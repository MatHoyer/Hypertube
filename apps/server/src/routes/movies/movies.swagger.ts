import {
  deleteMovieLikeSchemas,
  deleteMovieSubscribeSchemas,
  getMovieCastingSchema,
  getMovieCommentSchemas,
  getMovieResolutionsSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getMovieSubtitlesSchemas,
  getUrl,
  postMovieCommentSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  postMovieLikeSchemas,
  postMovieSubscribeSchemas,
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
                    details: {
                      id: 550,
                      imdb_id: "tt0137523",
                      original_title: "Fight Club",
                      original_language: "en",
                      title: "Fight Club",
                      overview:
                        "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
                      genres: [
                        { id: 18, name: "Drama" },
                        { id: 53, name: "Thriller" },
                      ],
                      vote_average: 8.4,
                      vote_count: 26280,
                      popularity: 61.416,
                      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                      backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
                      release_date: "1999-10-15",
                      adult: false,
                      hasDetails: true,
                    },
                    downloadState: "DOWNLOADED",
                    isSeen: true,
                  },
                  {
                    details: {
                      id: 157336,
                      imdb_id: "tt2380307",
                      original_title: "Interstellar",
                      original_language: "en",
                      title: "Interstellar",
                      overview:
                        "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
                      genres: [
                        { id: 12, name: "Adventure" },
                        { id: 18, name: "Drama" },
                        { id: 878, name: "Science Fiction" },
                      ],
                      vote_average: 8.4,
                      vote_count: 32562,
                      popularity: 146.981,
                      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
                      backdrop_path: "/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
                      release_date: "2014-11-05",
                      adult: false,
                      hasDetails: true,
                    },
                    downloadState: "WAITING",
                    isSeen: false,
                  },
                  {
                    details: {
                      id: 999999,
                      hasDetails: false,
                    },
                    downloadState: "NOT_DOWNLOADED",
                    isSeen: false,
                  },
                ],
                page: 1,
                pageSize: 20,
                total: 1543,
                totalPages: 78,
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
          description: "Get movie successfully",
          content: {
            "application/json": {
              example: {
                details: {
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
                  ],
                  vote_average: 8.4,
                  vote_count: 27500,
                  popularity: 85.3,
                  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                  backdrop_path: "/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
                  release_date: "1999-10-15",
                  adult: false,
                  hasDetails: true,
                },
                id: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                isSubscribed: true,
                likesNumber: 245,
                isLikedByUser: true,
              },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: null,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES_RESOLUTIONS, { tmdbId: "{tmdbId}" })]: {
    get: {
      summary: "Get movie resolutions",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: getMovieResolutionsSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie resolutions retrieved successfully",
          content: {
            "application/json": {
              example: {
                resolutions: [
                  {
                    id: "cm5a8b9c1d2e3f4g5h6i7j8k9",
                    movieId: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                    resolution: "720p",
                    size: "950MB",
                    downloadState: "DOWNLOADED",
                    indexerName: "YTS",
                    indexerId: 1,
                    releaseGuid: "abc123-yts-720p",
                    infoHash: "a1b2c3d4",
                    createdAt: "2026-01-15T10:30:00Z",
                    updatedAt: "2026-01-15T12:45:00Z",
                  },
                  {
                    id: "cm5a8b9c1d2e3f4g5h6i7j8k0",
                    movieId: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                    resolution: "1080p",
                    size: "2.1GB",
                    downloadState: "NOT_DOWNLOADED",
                    indexerName: "1337x",
                    indexerId: 2,
                    releaseGuid: "def456-1337x-1080p",
                    infoHash: "e5f6g7h8",
                    createdAt: "2026-01-15T10:30:00Z",
                    updatedAt: "2026-01-15T10:30:00Z",
                  },
                  {
                    id: "cm5a8b9c1d2e3f4g5h6i7j8k1",
                    movieId: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                    resolution: "2160p",
                    size: "4.5GB",
                    downloadState: "WAITING",
                    indexerName: "The Pirate Bay",
                    indexerId: 3,
                    releaseGuid: "ghi789-tpb-2160p",
                    infoHash: "i9j0k1l2",
                    createdAt: "2026-01-15T10:30:00Z",
                    updatedAt: "2026-01-15T14:20:00Z",
                  },
                ],
              },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES, {
    tmdbId: "{tmdbId}",
    resolutionId: "{resolutionId}",
  })]: {
    post: {
      summary: "Start movie resolution download (VPN required)",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: postMovieDownloadResolutionSchemas.urlParams.shape.tmdbId,
        },
        {
          in: "path",
          name: "resolutionId",
          required: true,
          schema:
            postMovieDownloadResolutionSchemas.urlParams.shape.resolutionId,
        },
      ],
      responses: {
        "200": {
          description: "Movie downloaded started",
          content: {
            "application/json": {
              example: { message: "Movie downloaded started" },
            },
          },
        },
        "400": {
          description: "Resolution already downloaded or in downloading queue",
          content: {
            "application/json": {
              example: {
                message:
                  "Resolution already downloaded or in downloading queue",
              },
            },
          },
        },
        "404": {
          description: "Movie or Resolution not found",
          content: {
            "application/json": {
              example: {
                message: "Movie or Resolution not found",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES_SUBTITLES, { tmdbId: "{tmdbId}" })]: {
    get: {
      summary: "Get movie subtitles",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: getMovieSubtitlesSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie subtitles retrieved successfully",
          content: {
            "application/json": {
              example: {
                subtitles: [
                  {
                    id: "cm5sub1a2b3c4d5e6f7g8h9i0",
                    movieId: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                    language: "en",
                    rating: 5,
                    downloadLink: "https://example.com",
                    downloadState: "DOWNLOADED",
                    createdAt: "2026-01-15T10:30:00Z",
                    updatedAt: "2026-01-15T12:45:00Z",
                  },
                  {
                    id: "cm5sub1a2b3c4d5e6f7g8h9i1",
                    movieId: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                    language: "fr",
                    rating: 4,
                    downloadLink: "https://example.com",
                    downloadState: "NOT_DOWNLOADED",
                    createdAt: "2026-01-15T10:30:00Z",
                    updatedAt: "2026-01-15T10:30:00Z",
                  },
                  {
                    id: "cm5sub1a2b3c4d5e6f7g8h9i2",
                    movieId: "33cd4882-eedd-4dd0-b7a6-790dbf15f7fa",
                    language: "es",
                    rating: 3,
                    downloadLink: "https://example.com",
                    downloadState: "DOWNLOADING",
                    createdAt: "2026-01-15T10:30:00Z",
                    updatedAt: "2026-01-15T14:20:00Z",
                  },
                ],
              },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES, {
    tmdbId: "{tmdbId}",
    subtitlesLanguage: "{subtitlesLanguage}",
  })]: {
    post: {
      summary: "Download movie subtitles language (VPN required)",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: postMovieDownloadSubtitlesSchemas.urlParams.shape.tmdbId,
        },
        {
          in: "path",
          name: "subtitlesLanguage",
          required: true,
          schema:
            postMovieDownloadSubtitlesSchemas.urlParams.shape.subtitlesLanguage,
        },
      ],
      responses: {
        "200": {
          description: "Subtitles downloaded",
          content: {
            "application/json": {
              example: { message: "Subtitles downloaded" },
            },
          },
        },
        "404": {
          description: "Movie or Subtitle not found",
          content: {
            "application/json": {
              example: {
                message: "Movie or Subtitle not found",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.MOVIES_SUBSCRIPTION, { tmdbId: "{tmdbId}" })]: {
    post: {
      summary: "Subscribe to movie",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: postMovieSubscribeSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie subscribed",
          content: {
            "application/json": {
              example: { message: "Movie subscribed" },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
        "409": {
          description: "Already subscribe to this movie",
          content: {
            "application/json": {
              example: {
                message: "Already subscribe to this movie",
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Unsubscribe to movie",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: deleteMovieSubscribeSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie unsubscribed",
          content: {
            "application/json": {
              example: { message: "Movie unsubscribed" },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
        "409": {
          description: "Already unsubscribe of this movie",
          content: {
            "application/json": {
              example: {
                message: "Already unsubscribe of this movie",
              },
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
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: postMovieLikeSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "201": {
          description: "Movie liked successfully",
          content: {
            "application/json": {
              example: { message: "Movie liked successfully" },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
        "409": {
          description: "Movie already liked",
          content: {
            "application/json": {
              example: { message: "Movie already liked" },
            },
          },
        },
      },
    },
    delete: {
      summary: "Dislike a movie",
      tags: ["Movies"],
      parameters: [
        {
          in: "path",
          name: "tmdbId",
          required: true,
          schema: deleteMovieLikeSchemas.urlParams.shape.tmdbId,
        },
      ],
      responses: {
        "200": {
          description: "Movie unliked successfully",
          content: {
            "application/json": {
              example: { message: "Movie unliked successfully" },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
        "409": {
          description: "Movie already unliked",
          content: {
            "application/json": {
              example: { message: "Movie already unliked" },
            },
          },
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
          description: "Movie comments got get successfully",
          content: {
            "application/json": {
              example: {
                comments: [
                  {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    userId: "user123",
                    createdAt: "2026-01-05T10:30:00Z",
                    updatedAt: "2026-01-05T10:30:00Z",
                    content:
                      "Great movie! I really enjoyed the cinematography.",
                    deletedAt: null,
                    user: {
                      id: "user123",
                      name: "John Doe",
                      image: "https://example.com/avatars/john.jpg",
                    },
                    likesNumber: 15,
                    isLikedByUser: true,
                    isOwnComment: false,
                    hasReplies: true,
                  },
                  {
                    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                    userId: "user456",
                    createdAt: "2026-01-04T15:20:00Z",
                    updatedAt: "2026-01-04T16:45:00Z",
                    content:
                      "The plot was a bit confusing but the acting was top-notch.",
                    deletedAt: null,
                    user: {
                      id: "user456",
                      name: "Jane Smith",
                      image: null,
                    },
                    likesNumber: 8,
                    isLikedByUser: false,
                    isOwnComment: true,
                    hasReplies: false,
                  },
                ],
                page: 1,
                pageSize: 2,
                total: 42,
                totalPages: 21,
              },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
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
            example: {
              content: "",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Comment posted successfully",
          content: {
            "application/json": {
              example: {
                message: "Comment succesfully posted on Movie",
              },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
            },
          },
        },
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
            example: {
              timestamp: 0,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Movie watch timer updated",
          content: {
            "application/json": {
              example: {
                message: "Movie watch timer updated",
              },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Movie not found",
              },
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
              example: {
                id: 550,
                cast: [
                  {
                    adult: false,
                    gender: 2,
                    id: 287,
                    name: "Brad Pitt",
                    original_name: "Brad Pitt",
                    popularity: 78.2,
                    profile_path: "/kU3B75TyRiCgE270EyZnHjfivoq.jpg",
                    credit_id: "52fe4250c3a36847f80149f7",
                    cast_id: 5,
                    character: "Tyler Durden",
                    order: 0,
                  },
                ],
                crew: [
                  {
                    adult: false,
                    gender: 2,
                    id: 7467,
                    name: "David Fincher",
                    original_name: "David Fincher",
                    popularity: 52.3,
                    profile_path: "/tpEczFclQZeKAiCeKZZ0adRvtfz.jpg",
                    credit_id: "52fe4250c3a36847f8014a05",
                    department: "Directing",
                    job: "Director",
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
};

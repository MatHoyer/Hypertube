import {
  deleteMovieLikeSchemas,
  deleteMovieSubscribeSchemas,
  getMovieCastingSchema,
  getMovieCommentSchemas,
  getMovieSchemas,
  getMoviesSchemas,
  getUrl,
  postMovieCommentSchemas,
  postMovieDownloadResolutionSchemas,
  postMovieDownloadSubtitlesSchemas,
  postMovieLikeSchemas,
  postMovieSubscribeSchemas,
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
          description: "Get movie successfully",
          content: {
            "application/json": {
              example: {
                resolutions: [
                  {
                    id: "cm5a8b9c1d2e3f4g5h6i7j8k9",
                    resolution: "720p",
                    size: "950MB",
                    downloadState: "DOWNLOADED",
                    provider: "YTS",
                  },
                  {
                    id: "cm5a8b9c1d2e3f4g5h6i7j8k0",
                    resolution: "1080p",
                    size: "2.1GB",
                    downloadState: "NOT_DOWNLOADED",
                    provider: "YTS",
                  },
                ],
                subtitles: [
                  {
                    id: "cm5sub1a2b3c4d5e6f7g8h9i0",
                    language: "en",
                    rating: 5,
                    downloadLink:
                      "https://yifysubtitles.org/subtitle/123456.zip",
                    downloadState: "DOWNLOADED",
                  },
                  {
                    id: "cm5sub1a2b3c4d5e6f7g8h9i1",
                    language: "fr",
                    rating: 4,
                    downloadLink:
                      "https://yifysubtitles.org/subtitle/123457.zip",
                    downloadState: "NOT_DOWNLOADED",
                  },
                ],
                isSubscribed: true,
                likesNumber: 245,
                isLikedByUser: true,
                id: "cm5movie1a2b3c4d5e6f7g8h9",
                tmdbId: 550,
                imdbId: "tt0137523",
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
  [getUrl(ROUTES.API.MOVIES, {
    tmdbId: "{tmdbId}",
    resolution: "{resolution}",
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
          name: "resolution",
          required: true,
          schema: {
            type: "string",
            enum: typedValues(
              postMovieDownloadResolutionSchemas.urlParams.shape.resolution.enum
            ),
          },
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

import {
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
          description: "User's watch history got get successfully",
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
                      hasDetails: true,
                    },
                    downloadState: "DOWNLOADED",
                    watchTimer: 3245,
                  },
                  {
                    details: {
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
                      hasDetails: true,
                    },
                    downloadState: "DOWNLOADING",
                    watchTimer: 0,
                  },
                  {
                    details: {
                      id: 278,
                      hasDetails: false,
                    },
                    downloadState: "NOT_DOWNLOADED",
                    watchTimer: 0,
                  },
                ],
                page: 1,
                pageSize: 3,
                total: 42,
                totalPages: 14,
              },
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
              example: { message: "History deleted" },
            },
          },
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
          description: "Movie deleted from history",
          content: {
            "application/json": {
              example: { message: "Movie deleted from history" },
            },
          },
        },
        "404": {
          description: "Movie not found",
          content: {
            "application/json": {
              example: { message: "Movie not found" },
            },
          },
        },
      },
    },
  },
};

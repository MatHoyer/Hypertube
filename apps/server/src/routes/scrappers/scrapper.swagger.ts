import {
  getUrl,
  getYtsDownloadResolutionSchemas,
  getYtsDownloadSubtitlesSchemas,
  getYtsFiltersSchemas,
  getYtsMovieDataSchemas,
  getYtsMoviesSchemas,
  getYtsPaginationSchemas,
  languageCodes,
  ytsQualities,
} from "@hypertube/libs";
import z from "zod";

const scrapperPathParam = {
  in: "path",
  name: "scrapper",
  required: true,
  schema: { ...z.enum(["yts"]), enum: ["yts"] },
};

export const scrapperSwagger = {
  [getUrl("api-filters", { scrapper: "{scrapper}" })]: {
    get: {
      summary: "Get filters",
      tags: ["Scrappers"],
      parameters: [scrapperPathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getYtsFiltersSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl("api-movies", { scrapper: "{scrapper}" })]: {
    get: {
      summary: "Get movies",
      tags: ["Scrappers"],
      parameters: [scrapperPathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getYtsMoviesSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl("api-movie", { scrapper: "{scrapper}", movieId: "{movieId}" })]: {
    get: {
      summary: "Get movie",
      tags: ["Scrappers"],
      parameters: [
        scrapperPathParam,
        {
          in: "path",
          name: "movieId",
          required: true,
          schema: z.string(),
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getYtsMovieDataSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl("api-pagination", { scrapper: "{scrapper}" })]: {
    get: {
      summary: "Get pagination",
      tags: ["Scrappers"],
      parameters: [scrapperPathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getYtsPaginationSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl("api-movie-download-resolution", {
    scrapper: "{scrapper}",
    movieId: "{movieId}",
    resolution: "{resolution}",
  })]: {
    get: {
      summary: "Get movie download resolution",
      tags: ["Downloads"],
      parameters: [
        scrapperPathParam,
        {
          in: "path",
          name: "movieId",
          required: true,
          schema: getYtsDownloadResolutionSchemas.urlParams.shape.movieId,
        },
        {
          in: "path",
          name: "resolution",
          required: true,
          schema: { ...z.enum(ytsQualities), enum: ytsQualities },
        },
      ],
    },
  },
  [getUrl("api-movie-download-subtitles", {
    scrapper: "{scrapper}",
    movieId: "{movieId}",
    subtitlesLanguage: "{subtitlesLanguage}",
  })]: {
    get: {
      summary: "Get movie download subtitles",
      tags: ["Downloads"],
      parameters: [
        scrapperPathParam,
        {
          in: "path",
          name: "movieId",
          required: true,
          schema: getYtsDownloadSubtitlesSchemas.urlParams.shape.movieId,
        },
        {
          in: "path",
          name: "subtitlesLanguage",
          required: true,
          schema: {
            ...z.enum(Object.keys(languageCodes)),
            enum: Object.keys(languageCodes),
          },
        },
      ],
    },
  },
};

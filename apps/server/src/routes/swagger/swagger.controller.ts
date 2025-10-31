import { getUrl } from "@hypertube/libs";
import { authentificationSwagger } from "../authentification/authentification.swagger";
import { imagesSwagger } from "../images/images.swagger";
import { moviesSwagger } from "../movies/movies.swagger";
import { usersSwagger } from "../users/users.swagger";

const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "Hypertube API Documentation",
    version: "1.0.0",
    description:
      "API documentation for Hypertube the movie torrent streaming platform",
  },
  tags: [
    {
      name: "Health",
      description: "Health check endpoints",
    },
    {
      name: "Auth",
      description: "Authentification endpoints",
    },
    {
      name: "Users",
      description: "Users endpoints",
    },
    {
      name: "Images",
      description: "Images endpoints",
    },
    {
      name: "Movies",
      description: "Movies endpoints",
    },
    {
      name: "Downloads",
      description: "Downloads endpoints",
    },
  ],
  paths: {
    [getUrl("api-health")]: {
      get: {
        summary: "Health check",
        tags: ["Health"],
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },

    ...imagesSwagger,
    ...usersSwagger,
    ...moviesSwagger,
    ...authentificationSwagger,
  },
};

export default openApiDoc;

import { getUrl, ROUTES } from "@hypertube/libs";
import { authentificationSwagger } from "../authentification/authentification.swagger";
import { commentsSwagger } from "../comments/comments.swagger";
import { historySwagger } from "../history/history.swagger";
import { imagesSwagger } from "../images/images.swagger";
import { moviesSwagger } from "../movies/movies.swagger";
import { notificationsSwagger } from "../notifications/notifications.swagger";
import { oauthSwagger } from "../oauth/oauth.swagger";
import { playlistsSwagger } from "../playlists/playlists.swagger";
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
      name: "Oauth credentials",
      description: "Oauth credentials endpoints",
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
      name: "Comments",
      description: "Comments endpoints",
    },
    {
      name: "Playlists",
      description: "Playlists endpoints",
    },
    {
      name: "Notifications",
      description: "Notifications endpoints",
    },
    {
      name: "History",
      description: "History endpoints",
    },
  ],
  paths: {
    [getUrl(ROUTES.API.HEALTH)]: {
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

    ...authentificationSwagger,
    ...oauthSwagger,
    ...usersSwagger,
    ...imagesSwagger,
    ...moviesSwagger,
    ...commentsSwagger,
    ...authentificationSwagger,
    ...playlistsSwagger,
    ...notificationsSwagger,
    ...historySwagger,
  },
};

export default openApiDoc;

import {
  getAccountsUsersSchemas,
  getSessionUsersSchemas,
  getUrl,
  patchUsersSchemas,
  ROUTES,
} from "@hypertube/libs";

const usersPathParam = {
  in: "path",
  name: "userId",
  required: true,
  schema: patchUsersSchemas.urlParams.shape.userId,
};

export const usersSwagger = {
  [getUrl(ROUTES.API.USERS, { userId: "{userId}" })]: {
    patch: {
      summary: "Update user information",
      tags: ["Users"],
      parameters: [usersPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: patchUsersSchemas.requirements,
            example: {
              name: "",
              email: "",
              image: "",
              username: "",
              firstName: "",
              lastName: "",
              imageId: "",
              oldPassword: "",
              password: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "User updated successfully",
          content: {
            "application/json": {
              schema: patchUsersSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.USERS_ACCOUNTS)]: {
    get: {
      summary: "Get accounts of user",
      tags: ["Users"],
      responses: {
        "200": {
          description: "User accounts taken successfully",
          content: {
            "application/json": {
              schema: getAccountsUsersSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.USERS_SESSION)]: {
    get: {
      summary: "Get session of user",
      tags: ["Users"],
      responses: {
        "200": {
          description: "User session taken successfully",
          content: {
            "application/json": {
              schema: getSessionUsersSchemas.response,
            },
          },
        },
      },
    },
  },
};

import {
  getAccountsUsersSchemas,
  getSessionUsersSchemas,
  getUrl,
  getUserSchemas,
  getUsersSchemas,
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
  [getUrl(ROUTES.API.USERS)]: {
    get: {
      summary: "Get users",
      tags: ["Users"],
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getUsersSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getUsersSchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "Users got get successfully",
          content: {
            "application/json": {
              schema: getUsersSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.USERS, { userId: "{userId}" })]: {
    get: {
      summary: "Get user by id",
      tags: ["Users"],
      parameters: [usersPathParam],
      responses: {
        "200": {
          description: "User got get successfully",
          content: {
            "application/json": {
              schema: getUserSchemas.response,
            },
          },
        },
      },
    },
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

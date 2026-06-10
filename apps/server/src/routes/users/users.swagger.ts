import {
  getUrl,
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
              example: {
                users: [
                  {
                    id: "6068b57e-3714-41e8-b760-f147116e7377",
                    name: "John Doe",
                    username: "johndoe",
                    displayUsername: "johndoe",
                    firstName: "John",
                    lastName: "Doe",
                    image: "https://example.com/avatars/johndoe.jpg",
                    createdAt: "2024-01-15T10:30:00.000Z",
                  },
                  {
                    id: "clx3c4d5e6f7g8h9i0j1k2l3m",
                    name: "Bob Wilson",
                    username: null,
                    displayUsername: null,
                    firstName: null,
                    lastName: null,
                    image: null,
                    createdAt: "2024-03-10T09:15:00.000Z",
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
              example: {
                user: {
                  id: "clx1a2b3c4d5e6f7g8h9i0j1k",
                  name: "John Doe",
                  username: "johndoe",
                  displayUsername: "johndoe",
                  firstName: "John",
                  lastName: "Doe",
                  image: "https://example.com/avatars/johndoe.jpg",
                  createdAt: "2024-01-15T10:30:00.000Z",
                },
                stats: {
                  totalLikes: 156,
                  totalComments: 42,
                },
              },
            },
          },
        },
        "404": {
          description: "User not found",
          content: {
            "application/json": {
              example: null,
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
            example: {
              name: "",
              email: "",
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
              example: { message: "User updated successfully" },
            },
          },
        },
        "400": {
          description: "User updated failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
        "401": {
          description: "Unauthorized to modify information",
          content: {
            "application/json": {
              example: {
                message:
                  "You are not authorized to modify information that is not yours",
              },
            },
          },
        },
        "429": {
          description: "Too many emails sent",
          content: {
            "application/json": {
              example: {
                message: "Too many emails sent",
              },
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
              example: {
                accounts: [
                  {
                    id: "acc_clx1a2b3c4d5e6f7g8h9i0j1k",
                    providerId: "google",
                    provider: "google (user@gmail.com)",
                    providerEmail: "user@gmail.com",
                    createdAt: "2024-01-15T10:30:00.000Z",
                    updatedAt: "2024-06-20T14:22:00.000Z",
                    accountId: "112233445566778899",
                    scopes: ["email", "profile", "openid"],
                  },
                  {
                    id: "acc_clx2b3c4d5e6f7g8h9i0j1k2l",
                    providerId: "github",
                    provider: "github (dev@company.com)",
                    providerEmail: "dev@company.com",
                    createdAt: "2024-03-10T09:15:00.000Z",
                    updatedAt: "2024-03-10T09:15:00.000Z",
                    accountId: "987654321",
                    scopes: ["user:email", "read:user"],
                  },
                  {
                    id: "acc_clx3c4d5e6f7g8h9i0j1k2l3m",
                    providerId: "school42",
                    provider: "school42 (student@student.42.fr)",
                    providerEmail: "student@student.42.fr",
                    createdAt: "2024-02-05T16:45:00.000Z",
                    updatedAt: "2024-08-12T11:30:00.000Z",
                    accountId: "42user123",
                    scopes: ["public"],
                  },
                ],
              },
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
              example: {
                session: {
                  id: "sess_clx1a2b3c4d5e6f7g8h9i0j1k",
                  userId: "clx1a2b3c4d5e6f7g8h9i0j1k",
                  expiresAt: "2025-01-22T10:30:00.000Z",
                  createdAt: "2024-12-22T10:30:00.000Z",
                  updatedAt: "2024-12-22T10:30:00.000Z",
                  token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0...",
                  ipAddress: "192.168.1.100",
                  userAgent:
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
                user: {
                  id: "clx1a2b3c4d5e6f7g8h9i0j1k",
                  name: "John Doe",
                  email: "john.doe@example.com",
                  emailVerified: true,
                  image: "https://example.com/avatars/johndoe.jpg",
                  createdAt: "2024-01-15T10:30:00.000Z",
                  updatedAt: "2024-12-20T14:22:00.000Z",
                  username: "johndoe",
                  displayUsername: "johndoe",
                  firstName: "John",
                  lastName: "Doe",
                  imageId: "img_clx9z8y7x6w5v4u3t2s1r0q",
                  emailCooldown: "2024-01-15T10:30:00.000Z",
                  passwordCooldown: "2024-12-15T10:30:00.000Z",
                },
              },
            },
          },
        },
        "404": {
          description: "No session found",
          content: {
            "application/json": {
              example: null,
            },
          },
        },
      },
    },
  },
};

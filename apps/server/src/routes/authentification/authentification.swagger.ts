import {
  emailVerificationAuthentificationSchemas,
  getUrl,
  ROUTES,
  typedValues,
  unlinkProviderAuthentificationSchemas,
} from "@hypertube/libs";

export const authentificationSwagger = {
  [getUrl(ROUTES.API.AUTHENTIFICATION_SIGNUP)]: {
    post: {
      summary: "Sign up",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              email: "",
              username: "",
              firstName: "",
              lastName: "",
              name: "",
              password: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Sign up successfully",
          content: {
            "application/json": {
              example: {
                token: null,
                user: {
                  name: "John Doe",
                  email: "example@example.com",
                  emailVerified: false,
                  image: null,
                  createdAt: "2026-06-10T19:54:01.074Z",
                  updatedAt: "2026-06-11T15:03:29.075Z",
                  username: "johndoe",
                  displayUsername: "johndoe",
                  firstName: "John",
                  lastName: "Doe",
                  imageId: null,
                  emailCooldown: "2026-06-10T19:59:01.084Z",
                  passwordCooldown: "2026-06-11T15:08:29.072Z",
                  id: "6068b57e-3714-41e8-b760-f147116e7377",
                },
                message: "Sign up successfully",
              },
            },
          },
        },
        "400": {
          description: "Sign up failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_SIGNIN)]: {
    post: {
      summary: "Sign in",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              username: "",
              password: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Sign in successfully",
          content: {
            "application/json": {
              example: {
                redirect: false,
                token: "9hJcxhqXK2c4d892J8PzlWU4sBM1WVbz",
                user: {
                  name: "John Doe",
                  email: "example@example.com",
                  emailVerified: true,
                  image: null,
                  createdAt: "2026-06-10T19:54:01.074Z",
                  updatedAt: "2026-06-11T15:03:29.075Z",
                  username: "johndoe",
                  displayUsername: "johndoe",
                  firstName: "John",
                  lastName: "Doe",
                  imageId: null,
                  emailCooldown: "2026-06-10T19:59:01.084Z",
                  passwordCooldown: "2026-06-11T15:08:29.072Z",
                  id: "6068b57e-3714-41e8-b760-f147116e7377",
                },
                message: "Sign in successfully",
              },
            },
          },
        },
        "400": {
          description: "Sign in failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_SIGNIN_SOCIAL)]: {
    post: {
      summary: "Sign in with social provider",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              providerId: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Sign in with social provider successfully",
          content: {
            "application/json": {
              example: {
                url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=123456.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=openid%20profile%20email&state=abc123xyz",
                message: "Sign in with social provider successfully",
              },
            },
          },
        },
        "400": {
          description: "Sign in with social provider failed",
          content: {
            "application/json": {
              example: { url: "", message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_REQUEST_PASSWORD_RESET)]: {
    post: {
      summary: "Request password reset",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              email: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Request password reset successfully",
          content: {
            "application/json": {
              example: { message: "Request password reset successfully" },
            },
          },
        },
        "400": {
          description: "Request password reset failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_RESET_PASSWORD)]: {
    post: {
      summary: "Reset password",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              newPassword: "",
              token: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Reset password successfully",
          content: {
            "application/json": {
              example: { message: "Reset password successfully" },
            },
          },
        },
        "400": {
          description: "Reset password failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_SIGNOUT)]: {
    post: {
      summary: "Sign out",
      tags: ["Auth"],
      responses: {
        "200": {
          description: "Sign out successfully",
          content: {
            "application/json": {
              example: { message: "Sign out successfully" },
            },
          },
        },
        "400": {
          description: "Sign out failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_EMAIL_VERIFICATION)]: {
    get: {
      summary: "Email verification",
      tags: ["Auth"],
      parameters: [
        {
          in: "query",
          name: "callbackURL",
          required: true,
          schema:
            emailVerificationAuthentificationSchemas.searchParams.shape
              .callbackURL,
        },
        {
          in: "query",
          name: "token",
          required: true,
          schema:
            emailVerificationAuthentificationSchemas.searchParams.shape.token,
        },
      ],
      responses: {
        "302": {
          description: "Email verification success",
        },
        "400": {
          description: "Invalid token",
          content: {
            "application/json": {
              example: { message: "Invalid token" },
            },
          },
        },
        "403": {
          description: "Expiration time",
          content: {
            "application/json": {
              example: { message: "Expiration time" },
            },
          },
        },
        "404": {
          description: "User not found",
          content: {
            "application/json": {
              example: { message: "User not found" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_LINK)]: {
    post: {
      summary: "Link provider",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              providerId: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Link provider successfully",
          content: {
            "application/json": {
              example: {
                url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=123456.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=openid%20profile%20email&state=abc123xyz",
                message: "Link provider successfully",
              },
            },
          },
        },
        "400": {
          description: "Link provider failed",
          content: {
            "application/json": {
              example: { url: "", message: "Translate error message" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.AUTHENTIFICATION_LINK, { providerId: "{providerId}" })]: {
    delete: {
      summary: "Unlink provider",
      tags: ["Auth"],
      parameters: [
        {
          in: "path",
          name: "providerId",
          required: true,
          schema: {
            type: "string",
            enum: typedValues(
              unlinkProviderAuthentificationSchemas.urlParams.shape.providerId
                .enum
            ),
          },
        },
      ],
      responses: {
        "200": {
          description: "Unlink provider successfully",
          content: {
            "application/json": {
              example: { message: "Unlink provider successfully" },
            },
          },
        },
        "400": {
          description: "Unlink provider failed",
          content: {
            "application/json": {
              example: { message: "Translate error message" },
            },
          },
        },
      },
    },
  },
};

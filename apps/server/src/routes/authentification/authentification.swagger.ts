import {
  getUrl,
  linkProviderAuthentificationSchemas,
  requestPasswordResetAuthentificationSchemas,
  resetPasswordAuthentificationSchemas,
  ROUTES,
  signInAuthentificationSchemas,
  signInSocialAuthentificationSchemas,
  signOutAuthentificationSchemas,
  signUpAuthentificationSchemas,
  unlinkProviderAuthentificationSchemas,
} from "@hypertube/libs";

const unlinkPathParam = {
  in: "path",
  name: "providerId",
  required: true,
  schema: unlinkProviderAuthentificationSchemas.urlParams.shape.providerId,
};

export const authentificationSwagger = {
  [getUrl(ROUTES.API.AUTHENTIFICATION_SIGNUP)]: {
    post: {
      summary: "Sign up",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: signUpAuthentificationSchemas.requirements,
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
              schema: signUpAuthentificationSchemas.response,
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
            schema: signInAuthentificationSchemas.requirements,
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
              schema: signInAuthentificationSchemas.response,
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
            schema: signInSocialAuthentificationSchemas.requirements,
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
              schema: signInSocialAuthentificationSchemas.response,
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
            schema: requestPasswordResetAuthentificationSchemas.requirements,
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
              schema: requestPasswordResetAuthentificationSchemas.response,
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
            schema: resetPasswordAuthentificationSchemas.requirements,
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
              schema: resetPasswordAuthentificationSchemas.response,
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
              schema: signOutAuthentificationSchemas.response,
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
            schema: linkProviderAuthentificationSchemas.requirements,
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
              schema: linkProviderAuthentificationSchemas.response,
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
      parameters: [unlinkPathParam],
      responses: {
        "200": {
          description: "Unlink provider successfully",
          content: {
            "application/json": {
              schema: unlinkProviderAuthentificationSchemas.response,
            },
          },
        },
      },
    },
  },
};

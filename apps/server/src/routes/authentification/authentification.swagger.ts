import {
  getUrl,
  linkProviderAuthentificationSchemas,
  requestPasswordResetAuthentificationSchemas,
  resetPasswordAuthentificationSchemas,
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
  [getUrl("api-authentification-signup")]: {
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
  [getUrl("api-authentification-signin")]: {
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
  [getUrl("api-authentification-signin-social")]: {
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
  [getUrl("api-authentification-request-password-reset")]: {
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
  [getUrl("api-authentification-reset-password")]: {
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
  [getUrl("api-authentification-signout")]: {
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
  [getUrl("api-authentification-link")]: {
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
  [getUrl("api-authentification-link", { providerId: "{providerId}" })]: {
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

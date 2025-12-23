import { deleteCredentialsSchemas, getUrl, ROUTES } from "@hypertube/libs";

export const oauthSwagger = {
  [getUrl(ROUTES.API.OAUTH_CREDENTIALS)]: {
    get: {
      summary: "Get oauth credentials",
      tags: ["Oauth credentials"],
      responses: {
        "200": {
          description: "Get oauth credentials successfully",
          content: {
            "application/json": {
              example: [
                {
                  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                  name: "first oauth",
                  createdAt: "2025-12-15T10:30:00.000Z",
                  updatedAt: "2025-12-15T10:30:00.000Z",
                  clientId: "ci_c7e201e3c23c6863fe0c3d7bc862de923867be91",
                },
                {
                  id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
                  name: "project 42",
                  createdAt: "2025-10-05T16:45:00.000Z",
                  updatedAt: "2025-10-05T16:45:00.000Z",
                  clientId: "ci_f9e8d7c6b5a4f3e2d1c9b8a7f6e5d4c3b2a1f8e9",
                },
              ],
            },
          },
        },
      },
    },
    post: {
      summary: "Generate credential oauth",
      tags: ["Oauth credentials"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              name: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description:
            "Get credential Id and Secret (don't lose your secret) successfully",
          content: {
            "application/json": {
              example: {
                clientId: "ci_c7e201e3c23c6863fe0c3d7bc862de923867be91",
                clientSecret:
                  "cs_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.OAUTH_CREDENTIALS, { credentialId: "{credentialId}" })]: {
    delete: {
      summary: "Delete oauth credential",
      tags: ["Oauth credentials"],
      parameters: [
        {
          in: "path",
          name: "credentialId",
          required: true,
          schema: deleteCredentialsSchemas.urlParams.shape.credentialId,
        },
      ],
      responses: {
        "200": {
          description: "Deleted oauth credential successfully",
          content: {
            "application/json": {
              example: { message: "Credential deleted" },
            },
          },
        },
        "404": {
          description: "Credential not found",
          content: {
            "application/json": {
              example: { message: "Credential not found" },
            },
          },
        },
      },
    },
  },
};

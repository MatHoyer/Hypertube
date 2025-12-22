import { getUrl, ROUTES } from "@hypertube/libs";

export const imagesSwagger = {
  [getUrl(ROUTES.API.IMAGES)]: {
    post: {
      summary: "Upload image",
      tags: ["Images"],
      consumes: ["multipart/form-data"],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "Image file",
                },
              },
              required: ["file"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              example: {
                path: "https://example.com/images/avatars/johndoe.jpg",
                id: "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },
        },
        "400": {
          description: "Invalid file",
          content: {
            "application/json": {
              example: {
                message: "Invalid file",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.IMAGES, { imageId: "{imageId}" })]: {
    delete: {
      summary: "Delete image",
      tags: ["Images"],
      parameters: [
        {
          in: "path",
          name: "imageId",
          required: true,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              example: { message: "OK" },
            },
          },
        },
      },
    },
  },
};

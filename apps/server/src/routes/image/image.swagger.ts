import { getImageSchemas, getUrl } from "@hypertube/libs";

const imagePathParam = {
  in: "path",
  name: "imageId",
  required: true,
};

export const imageSwagger = {
  [getUrl("api-image")]: {
    post: {
      summary: "Upload image",
      tags: ["Image"],
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
              schema: getImageSchemas.response,
            },
          },
        },
      },
    },
  },
  [`${getUrl("api-image")}/{imageId}`]: {
    get: {
      summary: "Get image",
      tags: ["Image"],
      parameters: [imagePathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getImageSchemas.response,
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete image",
      tags: ["Image"],
      parameters: [imagePathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getImageSchemas.response,
            },
          },
        },
      },
    },
  },
};

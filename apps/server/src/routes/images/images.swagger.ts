import { deleteImageSchemas, getUrl, postImageSchemas } from "@hypertube/libs";

const imagePathParam = {
  in: "path",
  name: "imageId",
  required: true,
};

export const imagesSwagger = {
  [getUrl("api-images")]: {
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
              schema: postImageSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl("api-images", { imageId: "{imageId}" })]: {
    delete: {
      summary: "Delete image",
      tags: ["Images"],
      parameters: [imagePathParam],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: deleteImageSchemas.response,
            },
          },
        },
      },
    },
  },
};

import { getUrl, patchUsersSchemas } from "@hypertube/libs";

const usersPathParam = {
  in: "path",
  name: "userId",
  required: true,
  schema: patchUsersSchemas.urlParams.shape.userId,
};

export const usersSwagger = {
  [getUrl("api-users", { userId: "{userId}" })]: {
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
              firstName: "",
              lastName: "",
              imageId: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "User updated successfully",
          content: {
            "application/json": {
              schema: { image: null },
            },
          },
        },
      },
    },
  },
};

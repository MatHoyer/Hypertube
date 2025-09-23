import { getUrl, patchUsersSchemas } from "@hypertube/libs";

const usersPathParam = {
  in: "path",
  name: "id",
  required: true,
  schema: patchUsersSchemas.urlParams.shape.id,
};

export const usersSwagger = {
  [getUrl("api-users", { userId: "{id}" })]: {
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

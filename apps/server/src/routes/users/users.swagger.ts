import { getUrl, patchUsersSchemas } from "@hypertube/libs";

export const usersSwagger = {
  [getUrl("api-users")]: {
    patch: {
      summary: "Update user information",
      tags: ["Users"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: patchUsersSchemas.response,
          },
        },
      },
    },
  },
};

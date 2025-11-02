import {
  getNotificationsSchemas,
  getUrl,
  patchNotificationSchemas,
  patchNotificationsSchemas,
} from "@hypertube/libs";

const notificationsPathParam = {
  in: "path",
  name: "notificationId",
  required: true,
  schema: patchNotificationSchemas.urlParams.shape.notificationId,
};

export const notificationsSwagger = {
  [getUrl("api-notifications")]: {
    get: {
      summary: "Get notifications",
      tags: ["Notifications"],

      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getNotificationsSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getNotificationsSchemas.searchParams.shape.pageSize,
        },
        {
          in: "query",
          name: "readStatus",
          required: false,
          schema: getNotificationsSchemas.searchParams.shape.readStatus,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              schema: getNotificationsSchemas.response,
            },
          },
        },
      },
    },
    patch: {
      summary: "Update notifications",
      tags: ["Notifications"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: patchNotificationsSchemas.requirements,
          },
          example: {
            read: false,
          },
        },
      },
      responses: {
        "200": {
          description: "Notifications updated successfully",
          content: {
            "application/json": {
              schema: patchNotificationsSchemas.response,
            },
          },
        },
      },
    },
  },
  [getUrl("api-notifications", { notificationId: "{notificationId}" })]: {
    patch: {
      summary: "Update notification",
      tags: ["Notifications"],
      parameters: [notificationsPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: patchNotificationsSchemas.requirements,
          },
          example: {
            read: false,
          },
        },
      },
      responses: {
        "200": {
          description: "Notification updated successfully",
          content: {
            "application/json": {
              schema: patchNotificationsSchemas.response,
            },
          },
        },
      },
    },
  },
};

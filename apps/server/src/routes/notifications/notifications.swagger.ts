import {
  getNotificationsSchemas,
  getUrl,
  patchNotificationSchemas,
  ROUTES,
  typedValues,
} from "@hypertube/libs";

const notificationsPathParam = {
  in: "path",
  name: "notificationId",
  required: true,
  schema: patchNotificationSchemas.urlParams.shape.notificationId,
};

export const notificationsSwagger = {
  [getUrl(ROUTES.API.NOTIFICATIONS)]: {
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
          schema: {
            type: "string",
            enum: typedValues(
              getNotificationsSchemas.searchParams.shape.readStatus.unwrap()
                .enum
            ),
          },
        },
      ],
      responses: {
        "200": {
          description: "Get notifications successfully",
          content: {
            "application/json": {
              example: {
                notifications: [
                  {
                    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    read: false,
                    type: "movieDownloaded",
                    title: "Movie Downloaded",
                    message:
                      "The movie 'Inception' has been successfully downloaded",
                    resourceUrl: "/movies/27205",
                    createdAt: "2025-12-23T10:30:00.000Z",
                    updatedAt: "2025-12-23T10:30:00.000Z",
                  },
                  {
                    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                    read: true,
                    type: "newCommentReply",
                    title: "New Reply",
                    message: "John Doe replied to your comment",
                    resourceUrl: "/movies/550",
                    createdAt: "2025-12-22T18:15:00.000Z",
                    updatedAt: "2025-12-23T08:00:00.000Z",
                  },
                  {
                    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
                    read: false,
                    type: "newCommentLike",
                    title: "Comment Liked",
                    message: "Alice Johnson liked your comment",
                    resourceUrl: "/movies/603",
                    createdAt: "2025-12-22T14:20:00.000Z",
                    updatedAt: "2025-12-22T14:20:00.000Z",
                  },
                  {
                    id: "d4e5f6a7-b8c9-0123-def4-56789012345",
                    read: false,
                    type: "movieDownloading",
                    title: "Movie Downloading",
                    message: "The movie 'The Matrix' is being downloaded",
                    resourceUrl: null,
                    createdAt: "2025-12-23T09:45:00.000Z",
                    updatedAt: "2025-12-23T09:45:00.000Z",
                  },
                ],
                page: 1,
                pageSize: 4,
                total: 42,
                totalPages: 11,
              },
            },
          },
        },
      },
    },
    patch: {
      summary: "Update all notifications",
      tags: ["Notifications"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              read: true,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Notifications updated successfully",
          content: {
            "application/json": {
              example: { message: "Notifications updated successfully" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.NOTIFICATIONS_STATS)]: {
    get: {
      summary: "Get notifications stats",
      tags: ["Notifications"],
      responses: {
        "200": {
          description: "Get notifications successfully",
          content: {
            "application/json": {
              example: {
                totalNotifications: 42,
                totalReadNotifications: 21,
                totalUnreadNotifications: 21,
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.NOTIFICATIONS, { notificationId: "{notificationId}" })]: {
    patch: {
      summary: "Update notification",
      tags: ["Notifications"],
      parameters: [notificationsPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              read: true,
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Notification updated successfully",
          content: {
            "application/json": {
              example: { message: "Notification updated successfully" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.NOTIFICATIONS_TEST)]: {
    post: {
      summary: "Send test notification",
      tags: ["Notifications"],
      responses: {
        "200": {
          description: "Test notification sent successfully",
          content: {
            "application/json": {
              example: { message: "Test notification sent successfully" },
            },
          },
        },
      },
    },
  },
};

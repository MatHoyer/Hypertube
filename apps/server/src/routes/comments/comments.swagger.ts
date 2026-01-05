import {
  getCommentRepliesSchemas,
  getCommentsSchemas,
  getUrl,
  ROUTES,
} from "@hypertube/libs";

const commentIdPathParam = {
  in: "path",
  name: "commentId",
  required: true,
  schema: { type: "string" },
};

export const commentsSwagger = {
  [getUrl(ROUTES.API.COMMENTS)]: {
    get: {
      summary: "Get comments",
      tags: ["Comments"],
      parameters: [
        {
          in: "query",
          name: "page",
          required: false,
          schema: getCommentsSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getCommentsSchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "OK",
          content: {
            "application/json": {
              example: {
                comments: [
                  {
                    id: "cmt_clx1a2b3c4d5e6f7g8h9i0j1k",
                    content:
                      "This is an amazing movie! Highly recommend watching it.",
                    userId: "clx1a2b3c4d5e6f7g8h9i0j1k",
                    parentId: "tt1375666",
                    parentType: "MOVIE",
                    createdAt: "2024-12-20T14:30:00.000Z",
                    updatedAt: "2024-12-20T14:30:00.000Z",
                    deletedAt: null,
                  },
                  {
                    id: "cmt_clx2b3c4d5e6f7g8h9i0j1k2l",
                    content: "I agree, the cinematography was stunning!",
                    userId: "clx2b3c4d5e6f7g8h9i0j1k2l",
                    parentId: "cmt_clx1a2b3c4d5e6f7g8h9i0j1k",
                    parentType: "COMMENT",
                    createdAt: "2024-12-20T15:45:00.000Z",
                    updatedAt: "2024-12-20T15:45:00.000Z",
                    deletedAt: null,
                  },
                  {
                    id: "cmt_clx3c4d5e6f7g8h9i0j1k2l3m",
                    content: "[Comment deleted by user]",
                    userId: "clx3c4d5e6f7g8h9i0j1k2l3m",
                    parentId: "tt1375666",
                    parentType: "MOVIE",
                    createdAt: "2024-12-19T10:20:00.000Z",
                    updatedAt: "2024-12-21T08:15:00.000Z",
                    deletedAt: "2024-12-21T08:15:00.000Z",
                  },
                ],
                page: 1,
                pageSize: 3,
                total: 31,
                totalPages: 11,
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.COMMENTS, { commentId: "{commentId}" })]: {
    get: {
      summary: "get comment by id",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      responses: {
        "200": {
          description: "Comment got get successfully",
          content: {
            "application/json": {
              example: {
                id: "550e8400-e29b-41d4-a716-446655440000",
                content:
                  "This is an amazing movie! Highly recommend watching it.",
                userId: "clx1a2b3c4d5e6f7g8h9i0j1k",
                parentId: "tt1375666",
                parentType: "MOVIE",
                createdAt: "2024-12-20T14:30:00.000Z",
                updatedAt: "2024-12-20T14:30:00.000Z",
                deletedAt: null,
              },
            },
          },
        },
        "404": {
          description: "Comment not found",
          content: {
            "application/json": {
              example: null,
            },
          },
        },
      },
    },
    patch: {
      summary: "Update a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              content: "",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Comment updated successfully",
          content: {
            "application/json": {
              example: { message: "Comment updated successfully" },
            },
          },
        },
        "401": {
          description: "You can only edit your own comment",
          content: {
            "application/json": {
              example: { message: "You can only edit your own comment" },
            },
          },
        },
        "404": {
          description: "Comment not found",
          content: {
            "application/json": {
              example: { message: "Comment not found" },
            },
          },
        },
        "410": {
          description: "Comment is already deleted",
          content: {
            "application/json": {
              example: { message: "Comment is already deleted" },
            },
          },
        },
      },
    },
    delete: {
      summary: "Delete a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      responses: {
        "200": {
          description: "Comment deleted successfully",
          content: {
            "application/json": {
              example: { message: "Comment deleted successfully" },
            },
          },
        },
        "401": {
          description: "You can only delete your own comment",
          content: {
            "application/json": {
              example: { message: "You can only delete your own comment" },
            },
          },
        },
        "404": {
          description: "Comment not found",
          content: {
            "application/json": {
              example: { message: "Comment not found" },
            },
          },
        },
        "410": {
          description: "Comment is already deleted",
          content: {
            "application/json": {
              example: { message: "Comment is already deleted" },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.COMMENTS_REPLIES, { commentId: "{commentId}" })]: {
    get: {
      summary: "Get comment replies",
      tags: ["Comments"],
      parameters: [
        commentIdPathParam,
        {
          in: "query",
          name: "page",
          required: false,
          schema: getCommentRepliesSchemas.searchParams.shape.page,
        },
        {
          in: "query",
          name: "pageSize",
          required: false,
          schema: getCommentRepliesSchemas.searchParams.shape.pageSize,
        },
      ],
      responses: {
        "200": {
          description: "Comment got get successfully",
          content: {
            "application/json": {
              example: {
                comments: [
                  {
                    userId: "user_123abc",
                    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    content:
                      "Great movie! The cinematography was absolutely stunning.",
                    createdAt: "2025-12-22T18:30:00.000Z",
                    updatedAt: "2025-12-22T18:30:00.000Z",
                    deletedAt: null,
                    user: {
                      id: "user_123abc",
                      name: "John Doe",
                      image: "https://example.com/avatars/johndoe.jpg",
                    },
                    likesNumber: 42,
                    isLikedByUser: true,
                    isOwnComment: false,
                    hasReplies: true,
                  },
                  {
                    userId: "user_456def",
                    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
                    content:
                      "I loved the soundtrack! Does anyone know the name of the song in the final scene?",
                    createdAt: "2025-12-22T14:15:00.000Z",
                    updatedAt: "2025-12-22T14:15:00.000Z",
                    deletedAt: null,
                    user: {
                      id: "user_456def",
                      name: "Jane Smith",
                      image: null,
                    },
                    likesNumber: 15,
                    isLikedByUser: false,
                    isOwnComment: false,
                    hasReplies: false,
                  },
                ],
                page: 1,
                pageSize: 2,
                total: 42,
                totalPages: 21,
              },
            },
          },
        },
        "404": {
          description: "Comment not found",
          content: {
            "application/json": {
              example: {
                message: "Comment not found",
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Reply to a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              content: "",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Reply posted successfully",
          content: {
            "application/json": {
              example: {
                message: "Comment succesfully posted on {parentType}",
              },
            },
          },
        },
        "400": {
          description: "You cannot reply to a subcomment",
          content: {
            "application/json": {
              example: {
                message: "You cannot reply to a subcomment",
              },
            },
          },
        },
        "404": {
          description: "Comment or Movie not found",
          content: {
            "application/json": {
              example: {
                message: "Comment or Movie not found",
              },
            },
          },
        },
        "410": {
          description: "Comment is already deleted",
          content: {
            "application/json": {
              example: {
                message: "Comment is already deleted",
              },
            },
          },
        },
      },
    },
  },
  [getUrl(ROUTES.API.COMMENTS_LIKES, { commentId: "{commentId}" })]: {
    post: {
      summary: "Like a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      responses: {
        "201": {
          description: "Comment liked successfully",
          content: {
            "application/json": {
              example: {
                message: "Comment liked successfully",
              },
            },
          },
        },
        "404": {
          description: "Comment not found",
          content: {
            "application/json": {
              example: {
                message: "Comment not found",
              },
            },
          },
        },
        "409": {
          description: "Comment already liked",
          content: {
            "application/json": {
              example: {
                message: "Comment already liked",
              },
            },
          },
        },
        "410": {
          description: "Comment is already deleted",
          content: {
            "application/json": {
              example: {
                message: "Comment is already deleted",
              },
            },
          },
        },
      },
    },
    delete: {
      summary: "Unlike a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      responses: {
        "200": {
          description: "Unliked successfully",
          content: {
            "application/json": {
              example: {
                message: "${parentType} unliked successfully",
              },
            },
          },
        },
        "404": {
          description: "Comment not found",
          content: {
            "application/json": {
              example: {
                message: "Comment not found",
              },
            },
          },
        },
        "409": {
          description: "Comment already unliked",
          content: {
            "application/json": {
              example: {
                message: "Comment already unliked",
              },
            },
          },
        },
        "410": {
          description: "Comment is already deleted",
          content: {
            "application/json": {
              example: {
                message: "Comment is already deleted",
              },
            },
          },
        },
      },
    },
  },
};

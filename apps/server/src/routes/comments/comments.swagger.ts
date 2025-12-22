import {
  deleteCommentLikeSchemas,
  getCommentRepliesSchemas,
  getCommentsSchemas,
  getUrl,
  postCommentLikeSchemas,
  postCommentReplySchemas,
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
        "400": {
          description: "Comment is deleted",
          content: {
            "application/json": {
              example: { message: "Comment is deleted" },
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
        "400": {
          description: "Comment already deleted",
          content: {
            "application/json": {
              example: { message: "Comment already deleted" },
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
          description: "OK",
          content: {
            "application/json": {
              schema: getCommentRepliesSchemas.response,
            },
          },
        },
        "404": {
          description: "Comment not found",
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
            schema: postCommentReplySchemas.requirements,
          },
        },
      },
      responses: {
        "201": {
          description: "Reply posted successfully",
          content: {
            "application/json": {
              schema: postCommentReplySchemas.response,
            },
          },
        },
        "404": {
          description: "Comment not found",
        },
        "500": {
          description: "Failed to post reply",
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
              schema: postCommentLikeSchemas.response,
            },
          },
        },
        "400": {
          description: "Comment already liked",
        },
        "404": {
          description: "Comment not found",
        },
      },
    },
    delete: {
      summary: "Unlike a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      responses: {
        "200": {
          description: "Comment unliked successfully",
          content: {
            "application/json": {
              schema: deleteCommentLikeSchemas.response,
            },
          },
        },
        "404": {
          description: "Like not found or comment not found",
        },
      },
    },
  },
};

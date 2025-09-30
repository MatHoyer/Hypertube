import {
  deleteCommentLikeSchemas,
  deleteCommentSchemas,
  getCommentRepliesSchemas,
  getUrl,
  patchCommentSchemas,
  postCommentLikeSchemas,
  postCommentReplySchemas,
} from "@hypertube/libs";

const commentIdPathParam = {
  in: "path",
  name: "commentId",
  required: true,
  schema: { type: "string" },
};

export const commentsSwagger = {
  [getUrl("api-comments", { commentId: "{commentId}" }) + "/replies"]: {
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

  [getUrl("api-comments", { commentId: "{commentId}" }) + "/like"]: {
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

  [getUrl("api-comments", { commentId: "{commentId}" })]: {
    patch: {
      summary: "Update a comment",
      tags: ["Comments"],
      parameters: [commentIdPathParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: patchCommentSchemas.requirements,
          },
        },
      },
      responses: {
        "200": {
          description: "Comment updated successfully",
          content: {
            "application/json": {
              schema: patchCommentSchemas.response,
            },
          },
        },
        "403": {
          description: "Unauthorized: you can only edit your own comment",
        },
        "404": {
          description: "Comment not found",
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
              schema: deleteCommentSchemas.response,
            },
          },
        },
        "404": {
          description: "Comment not found or unauthorized",
        },
        "500": {
          description: "Failed to delete comment",
        },
      },
    },
  },
};

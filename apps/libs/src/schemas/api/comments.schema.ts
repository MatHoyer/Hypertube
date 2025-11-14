import z from "zod";
import { commentSchema } from "../database/comments.schema.js";
import { userSchema } from "../database/user.schema.js";

export const getCommentRepliesSchemas = {
  urlParams: z.object({
    commentId: commentSchema.shape.parentId,
  }),
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  }),
  response: z.object({
    comments: z.array(
      commentSchema
        .pick({
          id: true,
          content: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          user: userSchema.pick({
            id: true,
            username: true,
          }),
          likesNumber: z.number(),
          isLikedByUser: z.boolean(),
        })
    ),
    page: z.number(),
    pageSize: z.number(),
    totalComments: z.number(),
    totalPages: z.number(),
  }),
};

export type TGetCommentRepliesSchemas = {
  urlParams: z.infer<typeof getCommentRepliesSchemas.urlParams>;
  searchParams: z.infer<typeof getCommentRepliesSchemas.searchParams>;
  response: z.infer<typeof getCommentRepliesSchemas.response>;
};

export const postCommentLikeSchemas = {
  urlParams: z.object({ commentId: commentSchema.shape.parentId }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostCommentLikeSchemas = {
  urlParams: z.infer<typeof postCommentLikeSchemas.urlParams>;
  response: z.infer<typeof postCommentLikeSchemas.response>;
};

export const postCommentReplySchemas = {
  urlParams: z.object({
    commentId: commentSchema.shape.parentId,
  }),
  requirements: z.object({
    content: z.string().min(1).max(1000),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPostCommentReplySchemas = {
  urlParams: z.infer<typeof postCommentReplySchemas.urlParams>;
  requirements: z.infer<typeof postCommentReplySchemas.requirements>;
  response: z.infer<typeof postCommentReplySchemas.response>;
};

export const deleteCommentLikeSchemas = {
  urlParams: z.object({ commentId: commentSchema.shape.parentId }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteCommentLike = {
  urlParams: z.infer<typeof deleteCommentLikeSchemas.urlParams>;
  response: z.infer<typeof deleteCommentLikeSchemas.response>;
};

export const deleteCommentSchemas = {
  urlParams: z.object({
    commentId: commentSchema.shape.id,
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TDeleteCommentSchemas = {
  urlParams: z.infer<typeof deleteCommentSchemas.urlParams>;
  response: z.infer<typeof deleteCommentSchemas.response>;
};

export const patchCommentSchemas = {
  urlParams: z.object({
    commentId: commentSchema.shape.id,
  }),
  requirements: z.object({
    content: commentSchema.shape.content.min(1),
  }),
  response: z.object({
    message: z.string(),
  }),
};

export type TPatchCommentSchemas = {
  urlParams: z.infer<typeof patchCommentSchemas.urlParams>;
  requirements: z.infer<typeof patchCommentSchemas.requirements>;
  response: z.infer<typeof patchCommentSchemas.response>;
};

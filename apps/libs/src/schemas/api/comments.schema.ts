import z from "zod";
import {
  commentResponseSchema,
  commentSchema,
} from "../database/comments.schema.js";

export const getCommentsSchemas = {
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  }),
  response: z.object({
    comments: z.array(commentSchema),
    page: z.number(),
    pageSize: z.number(),
    totalComments: z.number(),
    totalPages: z.number(),
  }),
};

export type TGetCommentsSchemas = {
  searchParams: z.infer<typeof getCommentsSchemas.searchParams>;
  response: z.infer<typeof getCommentsSchemas.response>;
};

export const getCommentSchemas = {
  urlParams: z.object({
    commentId: commentSchema.shape.id,
  }),
  response: commentSchema,
};

export type TGetCommentSchemas = {
  urlParams: z.infer<typeof getCommentSchemas.urlParams>;
  response: z.infer<typeof getCommentSchemas.response>;
};

export const getCommentRepliesSchemas = {
  urlParams: z.object({
    commentId: commentSchema.shape.parentId,
  }),
  searchParams: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10),
  }),
  response: z.object({
    comments: z.array(commentResponseSchema),
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
    content: z.string().trim().min(1).max(500),
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
    content: commentSchema.shape.content.trim().min(1).max(500),
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

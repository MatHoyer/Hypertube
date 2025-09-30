import z from "zod";
import { ParentTypes } from "../../const/global.const.js";
import { movieSchema } from "./movie.schema.js";
import { userSchema } from "./user.schema.js";

export const commentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  userId: userSchema.shape.id,
  //Use "z.uuid" in parentId "z.union" to avoid circular import of commentSchema.shape.id
  parentId: z.union([movieSchema.shape.id, z.uuid()]),
  parentType: z.enum(ParentTypes),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TCommentSchema = z.infer<typeof commentSchema>;

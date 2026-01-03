import z from "zod";
import { ParentTypes } from "../../const/global.const.js";
import { movieSchema } from "./movie.schema.js";
import { userSchema } from "./user.schema.js";

export const parentTypeEnum = z.enum(Object.values(ParentTypes));

export const likeSchema = z.object({
  id: z.uuid(),
  userId: userSchema.shape.id,
  //Use "z.uuid" in parentId "z.union" to avoid circular import of LikeSchema.shape.id
  parentId: z.union([movieSchema.shape.id, z.uuid()]),
  parentType: z.enum(ParentTypes),
  createdAt: z.date(),
});

export type TLikeSchema = z.infer<typeof likeSchema>;

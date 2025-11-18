import {
  ParentTypes,
  type TMovieSchema,
  type TParentType,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";
import type { QueryKey } from "@tanstack/react-query";

export type TQueryParent = {
  type: TParentType;
  id: TCommentSchema["id"] | TMovieSchema["tmdbId"];
};
export const getParentQueryKey = (parent: TQueryParent) => {
  if (parent.type === ParentTypes.MOVIE) {
    return ["movie-comments", parent.id] as QueryKey;
  }
  return ["comment-replies", parent.id] as QueryKey;
};

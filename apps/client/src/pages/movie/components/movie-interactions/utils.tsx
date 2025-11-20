import { getQueryKey } from "@/lib/getQueryKey";
import {
  ParentTypes,
  ROUTES,
  type TMovieSchema,
  type TParentType,
} from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";

export type TQueryParent = {
  type: TParentType;
  id: TCommentSchema["id"] | TMovieSchema["tmdbId"];
};
export const getParentQueryKey = (parent: TQueryParent) => {
  if (parent.type === ParentTypes.MOVIE) {
    return getQueryKey(ROUTES.API.MOVIES_COMMENT, {
      tmdbId: parent.id as number,
    });
  }
  return getQueryKey(ROUTES.API.COMMENTS_REPLIES, {
    commentId: parent.id as string,
  });
};

import { getQueryKey } from "@/lib/getQueryKey";
import { ParentTypes, ROUTES, type TMovieSchema } from "@hypertube/libs";
import type { TCommentSchema } from "@hypertube/libs/src/schemas/database/comments.schema";

type TQueryParentMovie = {
  type: typeof ParentTypes.MOVIE;
  id: TMovieSchema["tmdbId"];
};

type TQueryParentComment = {
  type: typeof ParentTypes.COMMENT;
  id: TCommentSchema["id"];
};

export type TQueryParent = TQueryParentComment | TQueryParentMovie;

const isParentMovie = (parent: TQueryParent): parent is TQueryParentMovie => {
  return parent.type === ParentTypes.MOVIE;
};

const isParentComment = (
  parent: TQueryParent
): parent is TQueryParentComment => {
  return parent.type === ParentTypes.COMMENT;
};

export const getParentQueryKey = (parent: TQueryParent) => {
  if (isParentMovie(parent)) {
    return getQueryKey(ROUTES.API.MOVIES_COMMENT, {
      tmdbId: parent.id,
    });
  }
  if (isParentComment(parent)) {
    return getQueryKey(ROUTES.API.COMMENTS_REPLIES, { commentId: parent.id });
  }
};

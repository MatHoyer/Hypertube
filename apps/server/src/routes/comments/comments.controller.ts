import {
  hypertubeLogger,
  notifications,
  ParentTypes,
  TDeleteCommentLike,
  TDeleteCommentSchemas,
  TGetCommentRepliesSchemas,
  TPatchCommentSchemas,
  TPostCommentLikeSchemas,
  TPostCommentReplySchemas,
} from "@hypertube/libs";
import { generateNotification, prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { commentParent, getParentComments } from "../global/comment.global";
import { likeParent, unlikeParent } from "../global/like.global";

export const getCommentReplies = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TGetCommentRepliesSchemas["urlParams"]> &
      TSearchParamsParser<TGetCommentRepliesSchemas["searchParams"]>
  >,
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { page, pageSize } = c.get("validatedSearchParams");
  const user = c.get("user");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return c.json({ message: "Comment not found " }, 404);
  }

  const result = await getParentComments(
    commentId,
    ParentTypes.COMMENT,
    user.id,
    page,
    pageSize,
  );

  if (result.data) {
    return c.json(result.data);
  }
  return c.json({ message: result.message }, result.status);
};

export const likeComment = async (
  c: Context<
    TIsLogged & TUrlParamsParser<TPostCommentLikeSchemas["urlParams"]>
  >,
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  if (comment.parentType === ParentTypes.MOVIE) {
    const movie = await prisma.movie.findUnique({
      where: { id: comment.parentId },
    });
    if (!movie) {
      return c.json({ message: "Movie not found" }, 404);
    }

    await generateNotification(comment.userId, notifications.NEW_COMMENT_LIKE, {
      tmdbId: movie.tmdbId,
    });
  }

  const result = await likeParent(id, comment.id, ParentTypes.COMMENT);
  return c.json({ message: result.message }, result.status);
};

export const replyToComment = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPostCommentReplySchemas["urlParams"]> &
      TBodyParser<TPostCommentReplySchemas["requirements"]>
  >,
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { content } = c.get("validatedBody");
  const { id } = c.get("user");

  const parentComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!parentComment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  if (parentComment.parentType !== ParentTypes.MOVIE) {
    return c.json({ message: "You cannot reply to a subcomment" }, 400);
  }
  const movie = await prisma.movie.findUnique({
    where: { id: parentComment.parentId },
  });
  if (!movie) {
    return c.json({ message: "Movie not found" }, 404);
  }

  await generateNotification(
    parentComment.userId,
    notifications.NEW_COMMENT_REPLY,
    {
      tmdbId: movie.tmdbId,
    }
  );

  const result = await commentParent(
    content,
    id,
    commentId,
    ParentTypes.COMMENT,
  );
  return c.json({ message: result.message }, result.status);
};

export const deleteCommentLike = async (
  c: Context<TIsLogged & TUrlParamsParser<TDeleteCommentLike["urlParams"]>>,
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  const result = await unlikeParent(id, commentId);
  return c.json({ message: result.message }, result.status);
};

export const deleteComment = async (
  c: Context<TIsLogged & TUrlParamsParser<TDeleteCommentSchemas["urlParams"]>>,
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      userId: id,
    },
  });

  if (!comment) {
    return c.json({ message: "Comment not found or unauthorized" }, 404);
  }

  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });
    return c.json({ message: "Comment deleted successfully" }, 200);
  } catch (error) {
    hypertubeLogger.error(`Error when deleting comment: ${error}`);
    return c.json({ message: "Failed to delete comment" }, 500);
  }
};

export const patchComment = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPatchCommentSchemas["urlParams"]> &
      TBodyParser<TPatchCommentSchemas["requirements"]>
  >,
) => {
  const body = c.get("validatedBody");
  const { id } = c.get("user");
  const { commentId } = c.get("validatedUrlParams");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  if (comment.userId !== id) {
    return c.json({ message: "You can only edit your own comment" }, 401);
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: body.content,
      updatedAt: new Date(),
    },
  });

  return c.json({
    message: "Comment updated successfully",
    comment: updatedComment,
  });
};

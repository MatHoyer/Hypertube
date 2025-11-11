import {
  ParentTypes,
  TDeleteCommentLike,
  TDeleteCommentSchemas,
  TGetCommentRepliesSchemas,
  TPatchCommentSchemas,
  TPostCommentLikeSchemas,
  TPostCommentReplySchemas,
} from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { Context } from "hono";
import { TBodyParser } from "../../middlewares/bodyParser";
import { TIsLogged } from "../../middlewares/isLogged";
import { TIsLoggedSafe } from "../../middlewares/isLoggedSafe";
import { TSearchParamsParser } from "../../middlewares/searchParamsParser";
import { TUrlParamsParser } from "../../middlewares/urlParamsParser";
import { commentParent, likeParent, unlikeParent } from "../global.helper";

export const getCommentReplies = async (
  c: Context<
    TIsLoggedSafe &
      TUrlParamsParser<TGetCommentRepliesSchemas["urlParams"]> &
      TSearchParamsParser<TGetCommentRepliesSchemas["searchParams"]>
  >
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { page, pageSize } = c.get("validatedSearchParams");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return c.json({ message: "Comment not found " }, 404);
  }

  const totalComments = await prisma.comment.count({
    where: {
      parentId: commentId,
      parentType: ParentTypes.COMMENT,
    },
  });

  const totalPages = Math.ceil(totalComments / pageSize);
  const skip = (page - 1) * pageSize;

  const comments = await prisma.comment.findMany({
    where: {
      parentId: commentId,
      parentType: ParentTypes.COMMENT,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  const user = c.get("user");
  const userId = user?.id;

  const commentIds = comments.map((c) => c.id);

  const likeCounts = await prisma.like.groupBy({
    by: ["parentId"],
    where: {
      parentId: { in: commentIds },
      parentType: ParentTypes.COMMENT,
    },
    _count: true,
  });

  let userLikes = new Set<string>();
  if (userId) {
    const likes = await prisma.like.findMany({
      where: {
        userId: userId,
        parentId: { in: commentIds },
        parentType: ParentTypes.COMMENT,
      },
      select: { parentId: true },
    });
    userLikes = new Set(likes.map((l) => l.parentId));
  }

  const likeCountMap = new Map(
    likeCounts.map((lc) => [lc.parentId, lc._count])
  );

  const commentsWithLikes = comments.map((comment) => ({
    ...comment,
    likesNumber: likeCountMap.get(comment.id) || 0,
    isLikedByUser: userLikes.has(comment.id),
  }));

  return c.json({
    comments: commentsWithLikes,
    page,
    pageSize,
    totalComments,
    totalPages,
  });
};

export const likeComment = async (
  c: Context<TIsLogged & TUrlParamsParser<TPostCommentLikeSchemas["urlParams"]>>
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  const result = await likeParent(id, comment.id, ParentTypes.COMMENT);
  return c.json({ message: result.message }, result.status);
};

export const replyToComment = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPostCommentReplySchemas["urlParams"]> &
      TBodyParser<TPostCommentReplySchemas["requirements"]>
  >
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

  const result = await commentParent(
    content,
    id,
    commentId,
    ParentTypes.COMMENT
  );
  return c.json({ message: result.message }, result.status);
};

export const deleteCommentLike = async (
  c: Context<TIsLogged & TUrlParamsParser<TDeleteCommentLike["urlParams"]>>
) => {
  const { commentId } = c.get("validatedUrlParams");
  const { id } = c.get("user");

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment) {
    return c.json({ message: "Comment not found" }, 404);
  }

  const result = await unlikeParent(id, commentId, ParentTypes.COMMENT);
  return c.json({ message: result.message }, result.status);
};

export const deleteComment = async (
  c: Context<TIsLogged & TUrlParamsParser<TDeleteCommentSchemas["urlParams"]>>
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
    console.error("Error when deleting comment", error);
    return c.json({ message: "Failed to delete comment" }, 500);
  }
};

export const patchComment = async (
  c: Context<
    TIsLogged &
      TUrlParamsParser<TPatchCommentSchemas["urlParams"]> &
      TBodyParser<TPatchCommentSchemas["requirements"]>
  >
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
    return c.json(
      { message: "Unauthorized: you can only edit your own comment" },
      403
    );
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

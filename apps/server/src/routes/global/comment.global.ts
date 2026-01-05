import { hypertubeLogger, ParentTypes, TParentType } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { ContentfulStatusCode } from "hono/utils/http-status";
import i18next from "i18next";

export const commentParent = async (
  content: string,
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: ContentfulStatusCode }> => {
  await prisma.comment.create({
    data: {
      content,
      userId,
      parentId,
      parentType,
    },
  });

  hypertubeLogger.info(
    `Comment succesfully posted on ${parentType} by ${userId}`
  );

  return {
    message: `Comment succesfully posted on ${parentType}`,
    status: 201,
  };
};

export const getParentComments = async (
  parentId: string,
  parentType: TParentType,
  userId: string,
  page: number,
  pageSize: number
) => {
  const totalComments = await prisma.comment.count({
    where: {
      parentId: parentId,
      parentType: parentType,
    },
  });

  const totalPages = Math.ceil(totalComments / pageSize);
  const skip = (page - 1) * pageSize;

  const comments = await prisma.comment.findMany({
    where: {
      parentId: parentId,
      parentType: parentType,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: parentType === ParentTypes.COMMENT ? "asc" : "desc",
    },
    skip,
    take: pageSize,
  });

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

  const replyCounts = await prisma.comment.groupBy({
    by: ["parentId"],
    where: {
      parentId: { in: commentIds },
      parentType: ParentTypes.COMMENT,
    },
    _count: true,
  });

  const likeCountMap = new Map(
    likeCounts.map((lc) => [lc.parentId, lc._count])
  );

  const commentsWithRepliesSet = new Set(replyCounts.map((rc) => rc.parentId));

  const commentsWithLikes = comments.map((comment) => ({
    ...comment,

    content: comment.deletedAt
      ? i18next.t("comments.deleted")
      : comment.content,
    likesNumber: likeCountMap.get(comment.id) || 0,
    isLikedByUser: userLikes.has(comment.id),
    isOwnComment: userId ? userId === comment.userId : false,
    hasReplies: commentsWithRepliesSet.has(comment.id),
  }));

  return {
    data: {
      comments: commentsWithLikes,
      page,
      pageSize,
      totalComments,
      totalPages,
    },
    message: `Comment succesfully posted on ${parentType}`,
    status: 200 as ContentfulStatusCode,
  };
};

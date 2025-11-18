import { hypertubeLogger, ParentTypes, TParentType } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";

type TStatusCode = 200 | 201 | 400 | 404 | 500;

export const likeParent = async (
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: TStatusCode }> => {
  try {
    await prisma.like.create({
      data: {
        userId,
        parentId,
        parentType,
      },
    });

    hypertubeLogger.info(`${parentType} liked successfully by user ${userId}`);

    return { message: `${parentType} liked successfully`, status: 201 };
  } catch (error) {
    hypertubeLogger.error(`Error when liking ${parentType} : ${error}`);
    return {
      message: `Unexpected error when liking ${parentType}`,
      status: 400,
    };
  }
};

export const commentParent = async (
  content: string,
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: TStatusCode }> => {
  try {
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
  } catch (error) {
    hypertubeLogger.error(`Error posting comment: ${error}`);
    return {
      message: `Unexpected error when posting a comment on ${parentType}`,
      status: 400,
    };
  }
};

export const unlikeParent = async (
  userId: string,
  parentId: string
): Promise<{ message: string; status: TStatusCode }> => {
  try {
    await prisma.like.delete({
      where: {
        userId_parentId: {
          userId,
          parentId,
        },
      },
    });

    hypertubeLogger.info(`${parentId} unliked successfully by ${userId}`);
    return {
      message: `${parentId} unliked successfully.`,
      status: 200,
    };
  } catch (error) {
    hypertubeLogger.error(`Error unliking comment: ${error}`);
    return {
      message: `Unexpected error when unliking ${parentId}`,
      status: 400,
    };
  }
};

export const getParentComments = async (
  parentId: string,
  parentType: TParentType,
  userId: string,
  page: number,
  pageSize: number
) => {
  try {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

    const likeCountMap = new Map(
      likeCounts.map((lc) => [lc.parentId, lc._count])
    );

    const commentsWithLikes = comments.map((comment) => ({
      ...comment,
      likesNumber: likeCountMap.get(comment.id) || 0,
      isLikedByUser: userLikes.has(comment.id),
      isOwnComment: userId ? userId === comment.userId : false,
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
      status: 200 as TStatusCode,
    };
  } catch (error) {
    hypertubeLogger.error(`Error getting comments: ${error}`);
    return {
      data: null,
      message: `Unexpected error when getting comments on ${parentId}`,
      status: 400 as TStatusCode,
    };
  }
};

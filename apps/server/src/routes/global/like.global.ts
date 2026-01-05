import { hypertubeLogger, TParentType } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const likeParent = async (
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: ContentfulStatusCode }> => {
  const like = await prisma.like.findUnique({
    where: { userId_parentId: { userId, parentId } },
  });
  if (like) return { message: `${parentType} already liked`, status: 409 };

  await prisma.like.create({
    data: {
      userId,
      parentId,
      parentType,
    },
  });

  hypertubeLogger.info(`${parentType} liked successfully by user ${userId}`);

  return { message: `${parentType} liked successfully`, status: 201 };
};

export const unlikeParent = async (
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: ContentfulStatusCode }> => {
  const like = await prisma.like.findUnique({
    where: { userId_parentId: { userId, parentId } },
  });
  if (!like) return { message: `${parentType} already unliked`, status: 409 };

  await prisma.like.delete({
    where: {
      userId_parentId: {
        userId,
        parentId,
      },
    },
  });

  hypertubeLogger.info(`${parentType} unliked successfully by ${userId}`);

  return {
    message: `${parentType} unliked successfully.`,
    status: 200,
  };
};

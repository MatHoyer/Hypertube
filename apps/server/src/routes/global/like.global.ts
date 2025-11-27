import { hypertubeLogger, TParentType } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";
import { ContentfulStatusCode } from "hono/utils/http-status";

export const likeParent = async (
  userId: string,
  parentId: string,
  parentType: TParentType,
): Promise<{ message: string; status: ContentfulStatusCode }> => {
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

export const unlikeParent = async (
  userId: string,
  parentId: string,
): Promise<{ message: string; status: ContentfulStatusCode }> => {
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

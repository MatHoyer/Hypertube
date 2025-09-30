import { TParentType } from "@hypertube/libs";
import { prisma } from "@hypertube/server-core";

type StatusCode = 200 | 201 | 400 | 404 | 500;

export const likeParent = async (
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: StatusCode }> => {
  try {
    await prisma.like.create({
      data: {
        userId,
        parentId,
        parentType,
      },
    });

    return { message: `${parentType} liked successfully`, status: 201 };
  } catch (error) {
    console.error(`Error when liking ${parentType}`, error);
    return {
      message: `Unexpected error when liking ${parentType}`,
      status: 400,
    };
  }
};

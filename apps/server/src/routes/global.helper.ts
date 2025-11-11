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

export const commentParent = async (
  content: string,
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: StatusCode }> => {
  try {
    await prisma.comment.create({
      data: {
        content,
        userId,
        parentId,
        parentType,
      },
    });

    return {
      message: `Comment succesfully posted on ${parentType}`,
      status: 201,
    };
  } catch (error) {
    console.error("Error posting comment: ", error);
    return {
      message: `Unexpected error when posting a comment on ${parentType}`,
      status: 400,
    };
  }
};

export const unlikeParent = async (
  userId: string,
  parentId: string,
  parentType: TParentType
): Promise<{ message: string; status: StatusCode }> => {
  try {
    await prisma.like.delete({
      where: {
        userId_parentId: {
          userId,
          parentId,
        },
      },
    });
    return {
      message: `${parentType} unliked successfully.`,
      status: 200,
    };
  } catch (error) {
    console.error("Error unliking comment: ", error);
    return {
      message: `Unexpected error when unliking ${parentType}`,
      status: 400,
    };
  }
};

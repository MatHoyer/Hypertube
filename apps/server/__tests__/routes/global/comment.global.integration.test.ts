import { ParentTypes } from "@hypertube/libs";
import { beforeEach, describe, expect, it } from "vitest";
import "../../../src/lib/i18n/i18n.js";
import { cleanTables, seedUser } from "../../db-helpers.js";
import {
  commentParent,
  getParentComments,
} from "../../../src/routes/global/comment.global.js";
import { likeParent } from "../../../src/routes/global/like.global.js";

describe("commentParent / getParentComments", () => {
  beforeEach(async () => {
    await cleanTables();
  });

  it("creates comments, paginates, and tracks like counts", async () => {
    const user = await seedUser();
    const parentId = "movie-parent-1";

    const first = await commentParent(
      "First comment",
      user.id,
      parentId,
      ParentTypes.MOVIE
    );
    expect(first.status).toBe(201);

    const second = await commentParent(
      "Second comment",
      user.id,
      parentId,
      ParentTypes.MOVIE
    );
    expect(second.status).toBe(201);

    const initial = await getParentComments(
      parentId,
      ParentTypes.MOVIE,
      user.id,
      1,
      10
    );

    expect(initial.data.totalComments).toBe(2);
    const commentToLike = initial.data.comments[0];

    const likeResult = await likeParent(
      user.id,
      commentToLike.id,
      ParentTypes.COMMENT
    );
    expect(likeResult.status).toBe(201);

    const result = await getParentComments(
      parentId,
      ParentTypes.MOVIE,
      user.id,
      1,
      10
    );

    expect(result.status).toBe(200);
    expect(result.data.comments).toHaveLength(2);

    const likedComment = result.data.comments.find(
      (c) => c.id === commentToLike.id
    );
    expect(likedComment?.likesNumber).toBe(1);
    expect(likedComment?.isLikedByUser).toBe(true);

    const otherComment = result.data.comments.find(
      (c) => c.id !== commentToLike.id
    );
    expect(otherComment?.likesNumber).toBe(0);
    expect(otherComment?.isLikedByUser).toBe(false);
  });
});

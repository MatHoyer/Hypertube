import { ParentTypes } from "@hypertube/libs";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanTables, seedUser } from "../../db-helpers.js";
import {
  likeParent,
  unlikeParent,
} from "../../../src/routes/global/like.global.js";

describe("likeParent / unlikeParent", () => {
  beforeEach(async () => {
    await cleanTables();
  });

  it("creates a like and returns 201", async () => {
    const user = await seedUser();
    const parentId = "movie-parent-1";

    const result = await likeParent(
      user.id,
      parentId,
      ParentTypes.MOVIE
    );

    expect(result.status).toBe(201);
    expect(result.message).toContain("liked successfully");
  });

  it("returns 409 when liking twice", async () => {
    const user = await seedUser();
    const parentId = "movie-parent-2";

    await likeParent(user.id, parentId, ParentTypes.MOVIE);
    const result = await likeParent(user.id, parentId, ParentTypes.MOVIE);

    expect(result.status).toBe(409);
    expect(result.message).toContain("already liked");
  });

  it("unlikes and returns 200", async () => {
    const user = await seedUser();
    const parentId = "movie-parent-3";

    await likeParent(user.id, parentId, ParentTypes.MOVIE);
    const result = await unlikeParent(user.id, parentId, ParentTypes.MOVIE);

    expect(result.status).toBe(200);
    expect(result.message).toContain("unliked successfully");
  });

  it("returns 409 when unliking twice", async () => {
    const user = await seedUser();
    const parentId = "movie-parent-4";

    await likeParent(user.id, parentId, ParentTypes.MOVIE);
    await unlikeParent(user.id, parentId, ParentTypes.MOVIE);
    const result = await unlikeParent(user.id, parentId, ParentTypes.MOVIE);

    expect(result.status).toBe(409);
    expect(result.message).toContain("already unliked");
  });
});

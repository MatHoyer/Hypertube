import { describe, expect, it } from "vitest";
import {
  isObjectNotFound,
  parseByteRange,
} from "../../../src/routes/streaming/streaming.utils.js";

describe("isObjectNotFound", () => {
  it("returns true for NotFound code", () => {
    expect(isObjectNotFound({ code: "NotFound" })).toBe(true);
  });

  it("returns true for NoSuchKey code", () => {
    expect(isObjectNotFound({ code: "NoSuchKey" })).toBe(true);
  });

  it("returns true for 404 statusCode", () => {
    expect(isObjectNotFound({ statusCode: 404 })).toBe(true);
  });

  it("returns false for other errors", () => {
    expect(isObjectNotFound({ code: "AccessDenied" })).toBe(false);
    expect(isObjectNotFound(null)).toBe(false);
    expect(isObjectNotFound("error")).toBe(false);
  });
});

describe("parseByteRange", () => {
  const fileSize = 10_000_000;

  it("parses range with explicit end", () => {
    const result = parseByteRange("bytes=0-999", fileSize);
    expect(result).toEqual({
      start: 0,
      end: 999,
      chunkSize: 1000,
      safeEnd: 999,
    });
  });

  it("uses default chunk size when end is omitted", () => {
    const result = parseByteRange("bytes=1000-", fileSize);
    expect(result).toMatchObject({
      start: 1000,
      end: 5_001_000,
      safeEnd: 5_001_000,
      chunkSize: 5_000_001,
    });
  });

  it("clamps end to file size", () => {
    const result = parseByteRange("bytes=9990000-99999999", fileSize);
    expect(result).toMatchObject({
      start: 9_990_000,
      safeEnd: fileSize - 1,
      chunkSize: 10_000,
    });
  });

  it("returns unsatisfiable when start >= fileSize", () => {
    const result = parseByteRange(`bytes=${fileSize}-`, fileSize);
    expect(result).toEqual({ unsatisfiable: true });
  });
});

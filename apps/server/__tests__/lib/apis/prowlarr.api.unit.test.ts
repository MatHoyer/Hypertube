import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockPutObject, mockEnv } = vi.hoisted(() => ({
  mockPutObject: vi.fn(),
  mockEnv: {
    PROWLARR_URL: "http://localhost:9696",
    PROWLARR_API_KEY: "test-api-key",
    PROWLARR_INDEXER_IDS: "",
  },
}));

vi.mock("@hypertube/server-core", () => ({
  env: mockEnv,
  BUCKETS: { MOVIES: "movies" },
  getMoviePath: (tmdbId: string, resolutionId: string, file: string) =>
    `${tmdbId}/${resolutionId}/${file}`,
  minio: { putObject: mockPutObject },
}));

vi.mock("@hypertube/libs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hypertube/libs")>();
  return {
    ...actual,
    hypertubeLogger: { error: vi.fn(), info: vi.fn() },
  };
});

import { ProwlarrApi } from "../../../src/lib/apis/prowlarr.api.js";

const makeRelease = (overrides: Record<string, unknown> = {}) => ({
  title: "Movie 2024 1080p BluRay x264",
  downloadUrl: "http://localhost:9696/download/abc",
  size: 2_200_000_000,
  infoHash: "abc123",
  seeders: 50,
  indexer: "YTS",
  indexerId: 1,
  guid: "guid-yts-1080p",
  ...overrides,
});

const makeResolution = (overrides: Record<string, unknown> = {}) => ({
  id: "resolution-id-1",
  resolution: "1080p",
  size: "2.20 GB",
  downloadState: "NOT_DOWNLOADED",
  indexerName: "YTS",
  indexerId: 1,
  releaseGuid: "guid-yts-1080p",
  infoHash: "abc123",
  ...overrides,
});

const searchTarget = {
  imdbId: "tt1234567",
  title: "Movie",
  year: 2024,
};

describe("ProwlarrApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.PROWLARR_INDEXER_IDS = "";
  });

  describe("getResolutions", () => {
    it("returns best release per quality per indexer", async () => {
      const releases = [
        makeRelease({
          title: "Movie 720p WEB-DL",
          downloadUrl: "http://localhost:9696/download/720-yts",
          size: 950_000_000,
          infoHash: "hash720-yts",
          seeders: 10,
          indexer: "YTS",
          indexerId: 1,
          guid: "guid-yts-720",
        }),
        makeRelease({
          title: "Movie 720p WEB-DL alt",
          downloadUrl: "http://localhost:9696/download/720-yts-alt",
          size: 900_000_000,
          infoHash: "hash720-yts-alt",
          seeders: 5,
          indexer: "YTS",
          indexerId: 1,
          guid: "guid-yts-720-alt",
        }),
        makeRelease({
          title: "Movie 720p WEB-DL",
          downloadUrl: "http://localhost:9696/download/720-1337x",
          size: 940_000_000,
          infoHash: "hash720-1337x",
          seeders: 8,
          indexer: "1337x",
          indexerId: 2,
          guid: "guid-1337x-720",
        }),
        makeRelease({
          title: "Movie 1080p BluRay x264",
          downloadUrl: "http://localhost:9696/download/1080",
          size: 2_200_000_000,
          infoHash: "hash1080",
          seeders: 50,
          indexer: "YTS",
          indexerId: 1,
          guid: "guid-yts-1080p",
        }),
      ];
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => releases,
        })
      );

      const api = new ProwlarrApi();
      const resolutions = await api.getResolutions(searchTarget);

      expect(resolutions).toHaveLength(3);
      expect(resolutions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            quality: "720p",
            indexerName: "YTS",
            releaseGuid: "guid-yts-720",
          }),
          expect.objectContaining({
            quality: "720p",
            indexerName: "1337x",
            releaseGuid: "guid-1337x-720",
          }),
          expect.objectContaining({
            quality: "1080p",
            indexerName: "YTS",
            releaseGuid: "guid-yts-1080p",
          }),
        ])
      );
    });

    it("filters releases without recognizable quality", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [
            makeRelease({ title: "Movie CAM unknown quality" }),
            makeRelease({ title: "Movie 2160p UHD BluRay" }),
          ],
        })
      );

      const api = new ProwlarrApi();
      const resolutions = await api.getResolutions(searchTarget);

      expect(resolutions).toHaveLength(1);
      expect(resolutions[0].quality).toBe("2160p");
    });

    it("merges imdb and text search results", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation((url: string) => {
          const query = new URL(url).searchParams.get("query") ?? "";
          const releases =
            query === "{ImdbId:tt1234567}"
              ? [
                  makeRelease({
                    title: "Movie 1080p BluRay x264",
                    indexer: "YTS",
                    indexerId: 1,
                    guid: "guid-yts-1080p",
                  }),
                ]
              : [
                  makeRelease({
                    title: "Movie.2024.1080p.BluRay.x264-GROUP",
                    indexer: "The Pirate Bay",
                    indexerId: 2,
                    guid: "guid-tpb-1080p",
                  }),
                ];

          return Promise.resolve({ ok: true, json: async () => releases });
        })
      );

      const api = new ProwlarrApi();
      const resolutions = await api.getResolutions(searchTarget);

      expect(resolutions).toHaveLength(2);
      expect(resolutions.map((item) => item.indexerName).sort()).toEqual([
        "The Pirate Bay",
        "YTS",
      ]);
    });

    it("returns empty array on search failure", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500 })
      );

      const api = new ProwlarrApi();
      const resolutions = await api.getResolutions(searchTarget);

      expect(resolutions).toEqual([]);
    });

    it("sends categories as repeated query params", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });
      vi.stubGlobal("fetch", fetchMock);

      const api = new ProwlarrApi();
      await api.getResolutions(searchTarget);

      const url = new URL(fetchMock.mock.calls[0][0] as string);
      expect(url.searchParams.get("query")).toBe("{ImdbId:tt1234567}");
      expect(url.searchParams.get("type")).toBe("movie");
      expect(new URL(fetchMock.mock.calls[1]?.[0] as string).searchParams.get("type")).toBe("search");
      expect(fetchMock.mock.calls[1]?.[0]).toContain("query=Movie+2024");
      expect(url.searchParams.getAll("categories")).toEqual([
        "2000",
        "2010",
        "2020",
        "2030",
        "2040",
        "2045",
        "2050",
        "2060",
      ]);
    });
  });

  describe("downloadTorrent", () => {
    it("downloads torrent by release guid and stores it in MinIO", async () => {
      const torrentBuffer = Buffer.from("torrent-data");
      const release = makeRelease({
        title: "Movie 1080p BluRay",
        downloadUrl: "http://127.0.0.1:9696/download/torrent",
        guid: "guid-yts-1080p",
      });
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/download/torrent")) {
          return Promise.resolve({
            ok: true,
            arrayBuffer: async () => torrentBuffer.buffer,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [release] });
      });
      vi.stubGlobal("fetch", fetchMock);

      const api = new ProwlarrApi();
      await api.downloadTorrent({
        movie: { tmdbId: 12345, imdbId: "tt1234567" } as never,
        resolution: makeResolution() as never,
        resolutionId: "resolution-id-1",
        search: searchTarget,
      });

      expect(fetchMock).toHaveBeenCalled();
      const downloadCall = fetchMock.mock.calls.find((call) =>
        String(call[0]).includes("/download/torrent")
      );
      expect(downloadCall?.[0]).toBe("http://localhost:9696/download/torrent");
      expect(downloadCall?.[1]).toEqual({
        headers: { "X-Api-Key": "test-api-key" },
      });
      expect(mockPutObject).toHaveBeenCalledWith(
        "movies",
        "12345/resolution-id-1/resolution.torrent",
        expect.any(Buffer)
      );
    });

    it("throws when release is not found", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [
            makeRelease({ title: "Movie 720p WEB-DL", guid: "other-guid" }),
          ],
        })
      );

      const api = new ProwlarrApi();
      await expect(
        api.downloadTorrent({
          movie: { tmdbId: 12345, imdbId: "tt1234567" } as never,
          resolution: makeResolution({ resolution: "1080p" }) as never,
          resolutionId: "resolution-id-1",
          search: searchTarget,
        })
      ).rejects.toThrow("Resolution (1080p, YTS) not found");
    });
  });
});

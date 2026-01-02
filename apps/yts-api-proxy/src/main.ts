import { serve } from "@hono/node-server";
import { hypertubeLogger, movieSchema, subtitleSchema } from "@hypertube/libs";
import { env } from "@hypertube/server-core";
import { Hono } from "hono";
import { YtsApi } from "./apis/yts.api";
import {
  downloadYifysubtitles,
  getSubtitlesDownloadLinks,
} from "./scrappers/yifysubtitles.scrapper";

const app = new Hono();

// Resolutions
app.get("/resolutions/:imdbId", async (c) => {
  const imdbId = c.req.param("imdbId");
  if (!imdbId) {
    return c.json({ error: "IMDB ID is required" }, 400);
  }

  const resolutions = await new YtsApi().getResolutions(imdbId);
  return c.json(resolutions);
});

app.post("/resolutions/download", async (c) => {
  const data = await c.req.json();
  const movie = movieSchema.parse(data.movie);
  const resolution = data.resolution;
  if (!resolution) {
    return c.json({ error: "Resolution is required" }, 400);
  }

  await new YtsApi().downloadTorrent(movie, resolution);
  return c.json({ message: "Download started" });
});

// Subtitles
app.get("/subtitles/:imdbId", async (c) => {
  const imdbId = c.req.param("imdbId");
  if (!imdbId) {
    return c.json({ error: "IMDB ID is required" }, 400);
  }

  const subtitles = await getSubtitlesDownloadLinks({ imdbId });
  return c.json(subtitles);
});

app.post("/subtitles/download", async (c) => {
  const data = await c.req.json();
  const subtitles = subtitleSchema.parse(data.subtitles);
  const tmdbId = data.tmdbId;
  if (!tmdbId) {
    return c.json({ error: "TMDB ID is required" }, 400);
  }

  await downloadYifysubtitles({ ...subtitles, tmdbId });
  return c.json({ message: "Download started" });
});

serve(
  {
    fetch: app.fetch,
    port: env.YTS_PROXY_PORT,
  },
  (info) => {
    hypertubeLogger.info(
      `Yts proxy is running on http://localhost:${info.port}`
    );
  }
);

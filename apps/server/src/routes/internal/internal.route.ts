import { movieSchema, resolutionSchema } from "@hypertube/libs";
import { Hono } from "hono";
import z from "zod";
import { bodyParser } from "../../middlewares/bodyParser";
import {
  movieDownloadJobEnd,
  movieDownloadJobStarted,
} from "./internal.controller";

const internalRouter = new Hono();

// internalRouter.use(
//   "/*",
//   cors({
//     origin: [env.SERVER_URL],
//   })
// );

internalRouter.post(
  "/movie-download-job-started",
  bodyParser(
    z.object({
      movieId: movieSchema.shape.id,
      resolution: resolutionSchema.shape.resolution,
      success: z.coerce.boolean(),
    })
  ),
  movieDownloadJobStarted
);

internalRouter.post(
  "/movie-download-job-end",
  bodyParser(
    z.object({
      movieId: movieSchema.shape.id,
      resolution: resolutionSchema.shape.resolution,
      success: z.coerce.boolean(),
    })
  ),
  movieDownloadJobEnd
);

export default internalRouter;

import type { TMovieSchema } from "@hypertube/libs";
import { TResolutionSchema } from "@hypertube/libs";
import { env } from "../../env";
import { getResolutionPath } from "../movie-folder-gestion/resolution";

export const downloadMovie = async (
  movieId: TMovieSchema["id"],
  resolution: TResolutionSchema["resolution"]
) => {
  const resolutionPath = getResolutionPath(movieId, resolution, true).slice(1);

  const Transmission = (await import("transmission-promise")).default;
  const transmission = new Transmission({
    host: env.TRANSMISSION_HOST,
    port: env.TRANSMISSION_RCP_PORT,
  });

  console.log("Downloading movie", resolutionPath);

  try {
    const result = await transmission.addFile(resolutionPath, {
      "download-dir": "/downloads",
    });
    console.log("Torrent ajouté avec l’ID:", result.id);
  } catch (err) {
    console.error("Erreur lors de l’ajout du torrent:", err);
  }
};

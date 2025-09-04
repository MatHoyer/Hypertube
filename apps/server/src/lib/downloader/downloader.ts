import Transmission from "transmission-promise";
import { env } from "../../env";

const transmission = new Transmission({
  host: env.TRANSMISSION_HOST,
  port: env.TRANSMISSION_RCP_PORT,
});

export const downloader = transmission;

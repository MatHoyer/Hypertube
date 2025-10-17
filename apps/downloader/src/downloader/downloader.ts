import { env } from "@hypertube/server-core";
import Transmission from "transmission-promise";

const transmission = new Transmission({
  host: env.TRANSMISSION_HOST,
  port: env.TRANSMISSION_RCP_PORT,
});

export const downloader = transmission;

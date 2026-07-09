import { hypertubeLogger } from "@hypertube/libs";
import { IStorageService, MinioStorageService } from "@hypertube/server-core";
import { deleteMoviesMonthlyCron } from "./crons/deleteMoviesMonthly.js";
import { healthcheckCron } from "./crons/healthcheck.js";

export const storageService: IStorageService = new MinioStorageService();

healthcheckCron();
deleteMoviesMonthlyCron();

hypertubeLogger.info("Cron jobs started");

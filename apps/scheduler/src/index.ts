import { hypertubeLogger } from "@hypertube/libs";
import { deleteMoviesMonthlyCron } from "./crons/deleteMoviesMonthly.js";
import { healthcheckCron } from "./crons/healthcheck.js";

healthcheckCron();
deleteMoviesMonthlyCron();

hypertubeLogger.info("Cron jobs started");

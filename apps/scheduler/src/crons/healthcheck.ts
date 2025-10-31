import { TLogger } from "@hypertube/libs";
import { generateNotification, notifications } from "@hypertube/server-core";
import { cronUTC } from "../cronUTC.js";

const HEALTHCHECK_CRON_EXPRESSION = "*/10 * * * * *";
const HEALTHCHECK_CRON_NAME = "Healthcheck";

const HEALTHCHECK_CRON_CALLBACK = async (localLogger: TLogger) => {
  localLogger.info("Scheduler healthcheck");
  generateNotification("cb3lmsYyZftpGrmHYVGtOBtUMB6Jetom", notifications.TEST, {
    someId: 1,
  });
};

export const healthcheckCron = () => {
  cronUTC({
    cronExpression: HEALTHCHECK_CRON_EXPRESSION,
    callback: HEALTHCHECK_CRON_CALLBACK,
    cronName: HEALTHCHECK_CRON_NAME,
  });
};

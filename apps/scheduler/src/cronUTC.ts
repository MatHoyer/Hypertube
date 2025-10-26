import { hypertubeLogger } from "@hypertube/libs";
import cron from "node-cron";

type TCronUTC = {
  cronExpression: string;
  callback: () => void | Promise<void>;
  cronName?: string;
};

export const cronUTC = ({ cronExpression, callback, cronName }: TCronUTC) => {
  cron.schedule(
    cronExpression,
    async () => {
      try {
        hypertubeLogger.info(`[${cronName}] Cron job started`);
        await callback();
      } catch (error) {
        hypertubeLogger.error(`[${cronName}] Error in cron job: ${error}`);
      }
    },
    {
      timezone: "UTC",
    }
  );
};

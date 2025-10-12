import { TJobData } from "@hypertube/libs";
import { downloadQueue } from "./Queue";

export const produceDownload = async (data: TJobData) => {
  await downloadQueue.add("download", data);
};

import { TDownloadJobData } from "@hypertube/libs";
import { downloadQueue } from "./Queue";

export const produceDownload = async (data: TDownloadJobData) => {
  await downloadQueue.add("download", data);
};

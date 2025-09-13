export const SCRAPPER_QUEUE = "scrapper";

export type TScrapperJobData = {
  movieId: string;
};

export const DOWNLOADER_QUEUE = "downloader";

export type TDownloaderJobData = {
  movieId: string;
};
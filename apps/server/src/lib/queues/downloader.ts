import { BullMQ, MOVIE_QUEUE } from "@hypertube/server-core";

let movieQueue: BullMQ<typeof MOVIE_QUEUE> | null = null;

export const getMovieQueue = () => {
  if (!movieQueue) {
    movieQueue = new BullMQ(MOVIE_QUEUE);
  }
  return movieQueue;
};

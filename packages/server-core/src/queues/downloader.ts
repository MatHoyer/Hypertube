import { BullMQ } from "../redis/BullMQ.js";
import { MOVIE_QUEUE } from "../redis/const.js";

let movieQueue: BullMQ<typeof MOVIE_QUEUE> | null = null;

export const getMovieQueue = () => {
  if (!movieQueue) {
    movieQueue = new BullMQ(MOVIE_QUEUE);
  }
  return movieQueue;
};

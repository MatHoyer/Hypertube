import { createContext, useContext } from "react";
import type { VideoPlayerContextType } from "./video-player.type";

export const VideoPlayerContext = createContext<
  VideoPlayerContextType | undefined
>(undefined);

export const useVideoPlayer = () => {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx)
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  return ctx;
};

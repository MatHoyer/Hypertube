import { createContext, useContext } from "react";
import type {
  VideoPlayerControlsContextType,
  VideoPlayerFastContextType,
} from "./video-player.type";

export const VideoPlayerControlsContext = createContext<
  VideoPlayerControlsContextType | undefined
>(undefined);

export const VideoPlayerFastContext = createContext<
  VideoPlayerFastContextType | undefined
>(undefined);

export const useVideoPlayerControls = () => {
  const ctx = useContext(VideoPlayerControlsContext);
  if (!ctx) {
    throw new Error(
      "useVideoPlayerControls must be used within a VideoPlayerProvider"
    );
  }
  return ctx;
};

export const useVideoPlayerFast = () => {
  const ctx = useContext(VideoPlayerFastContext);
  if (!ctx) {
    throw new Error(
      "useVideoPlayerFast must be used within a VideoPlayerProvider"
    );
  }
  return ctx;
};

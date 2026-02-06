import type { TSubtitleSchema } from "@hypertube/libs";
import { createContext, useContext } from "react";

type SubtitlesContextType = {
  subtitles: TSubtitleSchema[];
  streamableSubtitles: TSubtitleSchema[];
  isLoading: boolean;
  isError: boolean;
};

export const SubtitlesContext = createContext<SubtitlesContextType | undefined>(
  undefined
);

export const useSubtitles = () => {
  const ctx = useContext(SubtitlesContext);
  if (!ctx) {
    throw new Error("useSubtitles must be used within a SubtitlesProvider");
  }
  return ctx;
};

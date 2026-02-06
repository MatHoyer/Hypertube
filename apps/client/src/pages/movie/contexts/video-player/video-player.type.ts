import type { LanguageCode, TResolutionSchema } from "@hypertube/libs";
import type { KeyboardEvent } from "react";

export type Speed = 0.5 | 1 | 1.5 | 2;

export type VideoPlayerContextType = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;

  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;

  playing: boolean;
  togglePlay: () => void;

  muted: boolean;
  toggleMute: () => void;

  volume: number;
  handleVolumeChange: (volume: number) => void;
  handleJumpVolume: (units: number) => void;

  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setIsFullscreen: (isFullscreen: boolean) => void;

  progress: number;
  bufferedProgress: number;
  handleProgress: () => void;
  handleSeek: (percent: number) => void;
  handleJumpVideo: (seconds: number) => void;

  speed: Speed;
  handleSetSpeed: (speed: Speed) => void;

  mouseMoving: boolean;
  mouseClicked: boolean;
  triggerMouseMove: () => void;
  triggerMouseClick: () => void;

  selectedResolution: TResolutionSchema | null;
  setSelectedResolution: (resolution: TResolutionSchema) => void;

  selectedSubtitlesLanguage: LanguageCode | null;
  setSelectedSubtitlesLanguage: (language: LanguageCode | null) => void;
};

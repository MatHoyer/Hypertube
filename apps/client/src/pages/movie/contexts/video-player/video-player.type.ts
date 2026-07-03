import type { TpreviewMetadata, TResolutionSchema } from "@hypertube/libs";
import type { KeyboardEvent } from "react";

export type Speed = 0.5 | 1 | 1.5 | 2;

export type TPreview = {
  previewUrl: string;
  bitmap: ImageBitmap;
  metadata: TpreviewMetadata;
};

export type VideoPlayerContextType = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setVideoRef: (ref: HTMLVideoElement) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;

  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;

  playing: boolean;
  handlePlay: () => void;

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
  watchedTimestamp: number;
  setWatchedTimestamp: (timestamp: number) => void;

  speed: Speed;
  handleSetSpeed: (speed: Speed) => void;

  mouseMoving: boolean;
  mouseClicked: boolean;
  triggerMouseMove: () => void;
  triggerMouseClick: () => void;

  isResolutionsLoading: boolean;
  selectedResolution: TResolutionSchema | null;
  setSelectedResolution: (resolution: TResolutionSchema) => void;

  selectedSubtitlesLanguage: string | null | undefined;
  setSelectedSubtitlesLanguage: (language: string | null) => void;

  previewImage: TPreview | undefined;
};

import type { TResolutionSchema } from "@hypertube/libs";
import type { KeyboardEvent } from "react";

export type Speed = 0.5 | 1 | 1.5 | 2;

/**
 * Rarely-changing player state/handlers (play/pause, volume, fullscreen,
 * speed, resolution/subtitles selection, refs, ...). Consumers subscribing
 * only to this context do not re-render on high-frequency ticks such as
 * video timeupdate or mouse move.
 */
export type VideoPlayerControlsContextType = {
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

  handleProgress: () => void;
  handleSeek: (percent: number) => void;
  handleJumpVideo: (seconds: number) => void;
  watchedTimestamp: number;
  setWatchedTimestamp: (timestamp: number) => void;

  speed: Speed;
  handleSetSpeed: (speed: Speed) => void;

  triggerMouseMove: () => void;
  triggerMouseClick: () => void;

  isResolutionsLoading: boolean;
  selectedResolution: TResolutionSchema | null;
  setSelectedResolution: (resolution: TResolutionSchema) => void;

  selectedSubtitlesLanguage: string | null | undefined;
  setSelectedSubtitlesLanguage: (language: string | null) => void;
};

/**
 * High-frequency player state, updated several times per second during
 * playback (progress/bufferedProgress via timeupdate) or on every mouse
 * move (mouseMoving/mouseClicked). Kept in its own context so only
 * components that actually need per-tick updates (ProgressBar, Timer,
 * ControlsBar) re-render on these changes.
 */
export type VideoPlayerFastContextType = {
  progress: number;
  bufferedProgress: number;

  mouseMoving: boolean;
  mouseClicked: boolean;
};

import { useIsMobile } from "@/hooks/use-mobile";
import { useMouse } from "@/hooks/use-mouse";
import { useToggle } from "@/hooks/use-toggle";
import { type TResolutionSchema } from "@hypertube/libs";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useResolutions } from "../resolutions/resolutions.context";
import { usedKeys } from "./video-player.const";
import { VideoPlayerContext } from "./video-player.context";
import type { Speed } from "./video-player.type";

export const VideoPlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    value: muted,
    toggle: toggleMute,
    setValue: setMute,
  } = useToggle(false);
  const {
    value: playing,
    toggle: togglePlay,
    setValue: setPlaying,
  } = useToggle(false);
  const [volume, setVolume] = useState(20);
  const [progress, setProgress] = useState(0);
  const [bufferedProgress, setBufferedProgress] = useState(0);
  const {
    value: isFullscreen,
    toggle: toggleFullscreen,
    setValue: setIsFullscreen,
  } = useToggle(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const { mouseMoving, mouseClicked, triggerMouseMove, triggerMouseClick } =
    useMouse(videoRef, isMobile ? 3000 : undefined);

  const { streamableResolutions, isLoading: isResolutionsLoading } =
    useResolutions();

  const [selectedResolution, setSelectedResolution] =
    useState<TResolutionSchema | null>(null);
  const [selectedSubtitlesLanguage, setSelectedSubtitlesLanguage] = useState<
    string | null
  >(null);

  useEffect(
    () => setSelectedResolution(streamableResolutions[0] ?? null),
    [streamableResolutions]
  );

  // Play/Pause
  useEffect(() => {
    if (!videoRef.current) return;

    if (playing) {
      if (progress >= 100) setProgress(0);
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    videoRef.current.volume = volume / 100;
  }, [videoRef, playing, volume, progress, setProgress]);

  // Mute/Unmute
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = muted;
    if (!muted && volume === 0) setVolume(20);
  }, [videoRef, muted, volume, setVolume]);

  // Volume
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.volume = volume / 100;
  }, [videoRef, volume]);

  const handleVolumeChange = useCallback(
    (volume: number) => {
      if (!videoRef.current) return;
      if (volume < 0) volume = 0;
      if (volume > 100) volume = 100;
      if (volume === 0) setMute(true);
      else setMute(false);
      setVolume(volume);
    },
    [videoRef, setMute, setVolume]
  );

  // Fullscreen
  useEffect(() => {
    const handleFullscreen = async () => {
      if (!containerRef.current) return;
      if (document.readyState !== "complete") return;

      if (isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    };

    handleFullscreen();
  }, [containerRef, isFullscreen]);

  useEffect(() => {
    if (document.readyState !== "complete") return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setIsFullscreen]);

  // Progress
  const handleProgress = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const percent = (video.currentTime / video.duration) * 100;
    setProgress(percent);

    // Calculate buffered progress
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / video.duration) * 100;
      setBufferedProgress(bufferedPercent);
    }

    if (percent >= 100) {
      setPlaying(false);
    }
  }, [videoRef, setPlaying, setProgress, setBufferedProgress]);

  const handleSeek = useCallback(
    (percent: number) => {
      if (!videoRef.current) return;
      if (percent < 0) percent = 0;
      if (percent > 100) percent = 100;
      videoRef.current.currentTime =
        (percent / 100) * videoRef.current.duration;
      if (percent >= 100) setPlaying(false);
      setProgress(percent);
    },
    [videoRef, setProgress, setPlaying]
  );

  const handleSetSpeed = useCallback(
    (speed: Speed) => {
      if (!videoRef.current) return;
      setSpeed(speed);
      videoRef.current.playbackRate = speed;
    },
    [videoRef, setSpeed]
  );

  // Code shortcuts
  const handleJumpVideo = useCallback(
    (seconds: number) => {
      const currentTimeInSeconds =
        (progress * (videoRef.current?.duration ?? 0)) / 100;
      handleSeek(
        ((currentTimeInSeconds + seconds) / (videoRef.current?.duration ?? 0)) *
          100
      );
    },
    [videoRef, handleSeek, progress]
  );

  const handleJumpVolume = useCallback(
    (units: number) => {
      handleVolumeChange(volume + units);
    },
    [volume, handleVolumeChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!usedKeys.includes(e.key)) return;
      e.preventDefault();
      triggerMouseMove();

      switch (e.key) {
        case " ":
          triggerMouseClick();
          togglePlay();
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "ArrowRight":
          handleJumpVideo(10);
          break;
        case "ArrowLeft":
          handleJumpVideo(-10);
          break;
        case "ArrowUp":
          handleJumpVolume(10);
          break;
        case "ArrowDown":
          handleJumpVolume(-10);
          break;
      }
    },
    [
      triggerMouseMove,
      triggerMouseClick,
      togglePlay,
      toggleMute,
      toggleFullscreen,
      handleJumpVideo,
      handleJumpVolume,
    ]
  );

  return (
    <VideoPlayerContext.Provider
      value={{
        videoRef,
        containerRef,

        handleKeyDown,

        playing,
        togglePlay,

        muted,
        toggleMute,

        volume,
        handleVolumeChange,
        handleJumpVolume,

        isFullscreen,
        toggleFullscreen,
        setIsFullscreen,

        progress,
        bufferedProgress,
        handleProgress,
        handleSeek,
        handleJumpVideo,

        speed,
        handleSetSpeed,

        mouseMoving,
        mouseClicked,
        triggerMouseMove,
        triggerMouseClick,

        isResolutionsLoading,
        selectedResolution,
        setSelectedResolution,

        selectedSubtitlesLanguage,
        setSelectedSubtitlesLanguage,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

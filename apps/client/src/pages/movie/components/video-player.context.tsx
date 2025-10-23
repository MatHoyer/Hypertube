import { useIsMobile } from "@/hooks/use-mobile";
import { useMouse } from "@/hooks/use-mouse";
import { useToggle } from "@/hooks/use-toggle";
import { type TResolutionSchema, type TSubtitleSchema } from "@hypertube/libs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Speed = 0.5 | 1 | 1.5 | 2;

type VideoPlayerContextType = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;

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

  resolutions: TResolutionSchema[];
  selectedResolution: TResolutionSchema | null;
  setSelectedResolution: (resolution: TResolutionSchema) => void;

  subtitles: TSubtitleSchema[];
  selectedSubtitlesLanguage: string | null;
  setSelectedSubtitlesLanguage: (language: string | null) => void;
};

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(
  undefined
);

const usedKeys = [
  " ",
  "m",
  "f",
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
];

export const VideoPlayerProvider: React.FC<{
  children: React.ReactNode;
  resolutions: TResolutionSchema[];
  subtitles: TSubtitleSchema[];
}> = ({ children, resolutions, subtitles }) => {
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    value: muted,
    toggle: toggleMute,
    setValue: setMute,
  } = useToggle(false);
  const { value: playing, toggle: togglePlay } = useToggle(false);
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

  const [selectedResolution, setSelectedResolution] =
    useState<TResolutionSchema | null>(null);
  const [selectedSubtitlesLanguage, setSelectedSubtitlesLanguage] = useState<
    string | null
  >(null);

  // Play/Pause
  useEffect(() => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    videoRef.current.volume = volume / 100;
  }, [playing, volume]);

  // Mute/Unmute
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.muted = muted;
    if (!muted && volume === 0) setVolume(20);
  }, [muted, volume]);

  // Volume
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.volume = volume / 100;
  }, [volume]);

  const handleVolumeChange = (volume: number) => {
    if (!videoRef.current) return;
    if (volume < 0) volume = 0;
    if (volume > 100) volume = 100;
    if (volume === 0) setMute(true);
    else setMute(false);
    setVolume(volume);
  };

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
  }, [isFullscreen]);

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
  const handleProgress = () => {
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
      togglePlay();
    }
  };

  const handleSeek = (percent: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = (percent / 100) * videoRef.current.duration;
    setProgress(percent);
  };

  const handleSetSpeed = (speed: Speed) => {
    if (!videoRef.current) return;
    setSpeed(speed);
    videoRef.current.playbackRate = speed;
  };

  // Code shortcuts
  const handleJumpVideo = useCallback(
    (seconds: number) => {
      handleSeek(progress + seconds);
    },
    [progress]
  );

  const handleJumpVolume = useCallback(
    (units: number) => {
      handleVolumeChange(volume + units);
    },
    [volume]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!videoRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoRef]);

  return (
    <VideoPlayerContext.Provider
      value={{
        videoRef,
        containerRef,

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

        resolutions,
        selectedResolution,
        setSelectedResolution,

        subtitles,
        selectedSubtitlesLanguage,
        setSelectedSubtitlesLanguage,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayer = () => {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx)
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  return ctx;
};

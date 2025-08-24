import { useMouse } from "@/hooks/use-mouse";
import { useToggle } from "@/hooks/use-toggle";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
  handleProgress: () => void;
  handleSeek: (percent: number) => void;
  handleJumpVideo: (seconds: number) => void;

  mouseMoving: boolean;
  mouseClicked: boolean;
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
}> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { value: muted, toggle: toggleMute } = useToggle(false);
  const { value: playing, toggle: togglePlay } = useToggle(false);
  const [volume, setVolume] = useState(20);
  const [progress, setProgress] = useState(0);
  const {
    value: isFullscreen,
    toggle: toggleFullscreen,
    setValue: setIsFullscreen,
  } = useToggle(false);

  const { mouseMoving, mouseClicked, triggerMouseMove, triggerMouseClick } =
    useMouse(videoRef);

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
  }, [muted]);

  // Volume
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.volume = volume / 100;
  }, [volume]);

  const handleVolumeChange = (volume: number) => {
    if (!videoRef.current) return;
    if (volume < 0) volume = 0;
    if (volume > 100) volume = 100;
    setVolume(volume);
  };

  // Fullscreen
  useEffect(() => {
    const handleFullscreen = async () => {
      if (!containerRef.current) return;
      if (document.readyState !== "complete") return;

      if (isFullscreen) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    };

    handleFullscreen();
  }, [isFullscreen]);

  useEffect(() => {
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
    const percent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);
    if (percent >= 100) {
      togglePlay();
    }
  };

  const handleSeek = (percent: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = (percent / 100) * videoRef.current.duration;
    setProgress(percent);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        handleProgress,
        handleSeek,
        handleJumpVideo,

        mouseMoving,
        mouseClicked,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useVideoPlayer = () => {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx)
    throw new Error("useVideoPlayer must be used within a VideoPlayerProvider");
  return ctx;
};

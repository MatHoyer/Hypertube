import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useMouse } from "@/hooks/use-mouse";
import { useTimeoutResetState } from "@/hooks/use-timeout-state-reset";
import { cn } from "@/lib/utils";
import { Expand, Pause, Play, Shrink, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const usedKeys = [
  " ",
  "m",
  "f",
  "ArrowRight",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
];

const usePlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { mouseMoving, mouseClicked, triggerMouseMove, triggerMouseClick } =
    useMouse(videoRef);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    videoRef.current.volume = volume / 100;
    setPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (volume: number) => {
    if (!videoRef.current) return;
    if (volume < 0) volume = 0;
    if (volume > 100) volume = 100;
    videoRef.current.volume = volume / 100;
    setVolume(volume);
  };

  const handleProgress = () => {
    if (!videoRef.current) return;
    const percent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);
    if (percent >= 100) {
      setPlaying(false);
    }
  };

  const handleSeek = (progress: number) => {
    if (!videoRef.current) return;
    const time = (progress / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(progress);
  };

  const handleJumpVideo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
    handleSeek(
      (videoRef.current.currentTime / videoRef.current.duration) * 100
    );
  };
  const handleJumpVolume = (units: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume += units / 100;
    handleVolumeChange(videoRef.current.volume * 100);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!usedKeys.includes(e.key)) return;
      e.preventDefault();
      triggerMouseMove();
      if (e.key === " ") {
        triggerMouseClick();
        togglePlay();
      }
      if (e.key === "m") {
        toggleMute();
      }
      if (e.key === "f") {
        toggleFullscreen();
      }
      if (e.key === "ArrowRight") {
        handleJumpVideo(10);
      }
      if (e.key === "ArrowLeft") {
        handleJumpVideo(-10);
      }
      if (e.key === "ArrowUp") {
        handleJumpVolume(10);
      }
      if (e.key === "ArrowDown") {
        handleJumpVolume(-10);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoRef]);

  return {
    videoRef,
    containerRef,
    playing,
    volume,
    muted,
    progress,
    isFullscreen,
    mouseMoving,
    mouseClicked,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleSeek,
    handleVolumeChange,
    handleProgress,
    handleJumpVideo,
    handleJumpVolume,
  };
};

const VolumeControl: React.FC<{
  muted: boolean;
  volume: number;
  toggleMute: () => void;
  handleVolumeChange: (volume: number) => void;
}> = ({ muted, volume, toggleMute, handleVolumeChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mouseIn } = useMouse(containerRef);

  return (
    <div ref={containerRef} className="flex items-center gap-2 pr-2">
      <Button
        variant="ghost"
        onClick={toggleMute}
        className="dark p-2 rounded-full z-10"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        <span className="sr-only">Toggle mute</span>
      </Button>

      <div
        className={cn(
          "flex items-center overflow-hidden transition-all duration-300",
          mouseIn ? "w-24 opacity-100" : "w-0 opacity-0"
        )}
      >
        <AnimateApparition
          isAnimating={mouseIn}
          animation="slideToRight"
          className="flex items-center"
        >
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={muted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full"
          />
        </AnimateApparition>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const ProgressBar: React.FC<{
  videoRef: React.RefObject<HTMLVideoElement | null>;
  progress: number;
  handleSeek: (progress: number) => void;
}> = ({ videoRef, progress, handleSeek }) => {
  return (
    <div className="flex items-center w-full">
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={progress}
        onChange={(e) => handleSeek(Number(e.target.value))}
        className="flex-1 mx-3 accent-red-500"
      />
      <div className="flex items-center">
        <Typography variant="code">
          {formatTime((progress * (videoRef.current?.duration ?? 0)) / 100)} /{" "}
          {formatTime(videoRef.current?.duration ?? 0)}
        </Typography>
      </div>
    </div>
  );
};

const MiddleScreenInfo: React.FC<{
  type: "volume" | "play" | null;
  volume: number;
  playing: boolean;
}> = ({ type, volume, playing }) => {
  switch (type) {
    case "volume":
      return (
        <>
          <div className="absolute top-1/4 bg-black/50 rounded-2xl p-4">
            <Typography variant="h2" className="text-center text-white">
              {Math.round(volume)}%
            </Typography>
          </div>
          <div className="bg-black/50 rounded-full p-4">
            <Volume2 size={60} color="white" />
          </div>
        </>
      );
    case "play":
      return (
        <div className="bg-black/50 rounded-full p-4">
          {playing ? (
            <Play size={60} color="white" />
          ) : (
            <Pause size={60} color="white" />
          )}
        </div>
      );
  }
  return null;
};

const VideoPlayer = () => {
  const {
    videoRef,
    containerRef,
    playing,
    volume,
    muted,
    progress,
    isFullscreen,
    mouseMoving,
    mouseClicked,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleSeek,
    handleVolumeChange,
    handleProgress,
  } = usePlayer();

  const controlsRef = useRef<HTMLDivElement>(null);
  const { mouseIn } = useMouse(controlsRef);

  const { value: middleScreenInfo, setValue: setMiddleScreenInfo } =
    useTimeoutResetState<"volume" | "play" | null>(null, 1000);

  useEffect(() => {
    setMiddleScreenInfo("play");
  }, [playing]);

  useEffect(() => {
    setMiddleScreenInfo("volume");
  }, [volume]);

  return (
    <div
      ref={containerRef}
      className="size-full bg-black rounded-2xl shadow-lg overflow-hidden relative"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src="/test-video.mp4"
        className="size-full"
        onTimeUpdate={handleProgress}
        controls={false}
      />

      <AnimateApparition
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        animation="fade"
        isAnimating={middleScreenInfo !== null}
      >
        <MiddleScreenInfo
          type={middleScreenInfo}
          volume={volume}
          playing={playing}
        />
      </AnimateApparition>

      <AnimateApparition
        ref={controlsRef}
        isAnimating={mouseMoving || mouseClicked || mouseIn || !playing}
        animation="slideToTop"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="absolute bottom-0 left-0 right-0 p-2"
      >
        <Card className="dark flex flex-row items-center justify-between size-full p-3 bg-black/30">
          <Button
            variant="ghost"
            onClick={togglePlay}
            className="dark p-2 rounded-full"
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          <VolumeControl
            muted={muted}
            volume={volume}
            toggleMute={toggleMute}
            handleVolumeChange={handleVolumeChange}
          />

          <ProgressBar
            videoRef={videoRef}
            progress={progress}
            handleSeek={handleSeek}
          />

          <Button
            variant="ghost"
            onClick={toggleFullscreen}
            className="p-2 rounded-full"
          >
            {isFullscreen ? (
              <Shrink size={20} color="white" />
            ) : (
              <Expand size={20} color="white" />
            )}
          </Button>
        </Card>
      </AnimateApparition>
    </div>
  );
};

export default VideoPlayer;

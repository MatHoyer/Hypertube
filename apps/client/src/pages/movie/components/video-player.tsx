import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { useAnimateApparitionAndDisparition } from "@/components/animated/animate-apparition/useAnimateApparition";
import { useMouse } from "@/hooks/use-mouse";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const usedKeys = [" ", "m", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

const usePlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(20);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const { mouseMoving, mouseClicked, triggerMouseMove } = useMouse(videoRef);

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
    videoRef.current.muted = !muted;
    setMuted((prev) => !prev);
  };

  const handleVolumeChange = (volume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume / 100;
    setVolume(volume);
  };

  const handleProgress = () => {
    if (!videoRef.current) return;
    const percent =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(percent);
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
    setProgress(
      (videoRef.current.currentTime / videoRef.current.duration) * 100
    );
  };
  const handleJumpVolume = (units: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume += units / 100;
    setVolume(videoRef.current.volume * 100);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!usedKeys.includes(e.key)) return;
      e.preventDefault();
      triggerMouseMove();
      if (e.key === " ") {
        togglePlay();
      }
      if (e.key === "m") {
        toggleMute();
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
    playing,
    volume,
    muted,
    progress,
    mouseMoving,
    mouseClicked,
    togglePlay,
    toggleMute,
    handleSeek,
    handleVolumeChange,
    handleProgress,
    handleJumpVideo,
    handleJumpVolume,
  };
};

const VideoPlayer = () => {
  const {
    videoRef,
    playing,
    volume,
    muted,
    progress,
    mouseMoving,
    mouseClicked,
    togglePlay,
    toggleMute,
    handleSeek,
    handleVolumeChange,
    handleProgress,
  } = usePlayer();

  const { isAnimating, animate } = useAnimateApparitionAndDisparition();

  return (
    <div
      className="size-full bg-black rounded-2xl shadow-lg overflow-hidden relative"
      onClick={() => {
        togglePlay();
        animate();
      }}
    >
      {/* Video */}
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
        isAnimating={isAnimating}
      >
        <div className="bg-black/50 rounded-full p-4">
          {playing ? (
            <Play size={60} color="white" />
          ) : (
            <Pause size={60} color="white" />
          )}
        </div>
      </AnimateApparition>

      {/* Controls */}
      <AnimateApparition
        isAnimating={mouseMoving || mouseClicked}
        animation="slideToTop"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="flex items-center justify-between p-3 absolute bottom-0 left-0 right-0 bg-black/30"
      >
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>

        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="flex-1 mx-3 accent-red-500"
        />

        {/* Mute */}
        <button
          onClick={toggleMute}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="flex-1 mx-3 accent-red-500"
        />
      </AnimateApparition>
    </div>
  );
};

export default VideoPlayer;

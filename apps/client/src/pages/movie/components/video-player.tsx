import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useMouse } from "@/hooks/use-mouse";
import { useTimeoutResetState } from "@/hooks/use-timeout-state-reset";
import { cn } from "@/lib/utils";
import { Expand, Pause, Play, Shrink, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";
import { useVideoPlayer } from "./video-player.context";

const MiddleScreenInfo: React.FC<{
  type: "volume" | "play" | null;
}> = ({ type }) => {
  const { volume, playing } = useVideoPlayer();

  if (type === null) return null;

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
};

const PlayPauseButton = () => {
  const { playing, togglePlay } = useVideoPlayer();
  return (
    <Button variant="ghost" onClick={togglePlay} className="p-2 rounded-full">
      {playing ? <Pause size={20} /> : <Play size={20} />}
    </Button>
  );
};

const VolumeControl = () => {
  const { muted, volume, toggleMute, handleVolumeChange } = useVideoPlayer();

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
            className="w-full accent-primary"
          />
        </AnimateApparition>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const ProgressBar = () => {
  const { videoRef, progress, handleSeek } = useVideoPlayer();

  const currentTime = formatTime(
    (progress * (videoRef.current?.duration ?? 0)) / 100
  );
  const duration = formatTime(videoRef.current?.duration ?? 0);

  return (
    <div className="flex items-center w-full">
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={progress}
        onChange={(e) => handleSeek(Number(e.target.value))}
        className="flex-1 mx-3 accent-primary"
      />
      <div className="flex items-center">
        {currentTime === null || duration === null ? (
          <Skeleton className="w-[85px] h-[20px]" />
        ) : (
          <Typography variant="code">
            {currentTime} / {duration}
          </Typography>
        )}
      </div>
    </div>
  );
};

const FullscreenButton = () => {
  const { isFullscreen, toggleFullscreen } = useVideoPlayer();

  return (
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
  );
};

const VideoPlayer = () => {
  const {
    videoRef,
    containerRef,
    playing,
    volume,
    mouseMoving,
    mouseClicked,
    togglePlay,
    handleProgress,
  } = useVideoPlayer();

  const controlsRef = useRef<HTMLDivElement>(null);
  const { mouseIn } = useMouse(controlsRef);

  const { value: middleScreenInfo, setValue: setMiddleScreenInfo } =
    useTimeoutResetState<"volume" | "play" | null>(null, 1000);

  useEffect(() => {
    setMiddleScreenInfo("play");
  }, [playing, setMiddleScreenInfo]);

  useEffect(() => {
    setMiddleScreenInfo("volume");
  }, [volume, setMiddleScreenInfo]);

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
        <MiddleScreenInfo type={middleScreenInfo} />
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
          <PlayPauseButton />
          <VolumeControl />
          <ProgressBar />
          <FullscreenButton />
        </Card>
      </AnimateApparition>
    </div>
  );
};

export default VideoPlayer;

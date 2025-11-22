import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMouse } from "@/hooks/use-mouse";
import { useTimeoutResetState } from "@/hooks/use-timeout-state-reset";
import { cn } from "@/lib/utils";
import { getUrl, languageCodes, ROUTES, ytsQualities } from "@hypertube/libs";
import { intervalToDuration } from "date-fns";
import { Expand, Pause, Play, Shrink, Volume2, VolumeX } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useTranslation } from "react-i18next";
import { useVideoPlayer } from "../contexts/video-player/video-player.context";
import { MoviePageParamsSchema } from "../schemas/urlParams.schema";
import SettingsButton from "./dropdown-menu-navigating/dropdown-menu-navigating";

const MiddleScreenInfo: React.FC<{
  type: "volume" | "play" | null;
}> = ({ type }) => {
  const isMobile = useIsMobile();
  const { volume, playing } = useVideoPlayer();

  if (type === null) return null;

  if (isMobile) {
    return null;
  }

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

const PlayPauseButton: React.FC<ComponentProps<typeof Button>> = ({
  className,
  ...props
}) => {
  const { playing, togglePlay } = useVideoPlayer();
  return (
    <Button
      variant="ghost"
      onClick={togglePlay}
      className={cn("p-2 rounded-full", className)}
      {...props}
    >
      {playing ? (
        <Pause size={20} color="white" />
      ) : (
        <Play size={20} color="white" />
      )}
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
          mouseIn ? "w-24 opacity-100" : "w-0 opacity-0",
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

const secondsToHMS = (totalSeconds: number) => {
  const d = intervalToDuration({
    start: 0,
    end: totalSeconds * 1000,
  });

  const hours = d.hours ? `${d.hours.toString().padStart(2, "0")}:` : "00:";

  const minutes = d.minutes
    ? `${d.minutes.toString().padStart(2, "0")}:`
    : "00:";

  const seconds = d.seconds ? `${d.seconds.toString().padStart(2, "0")}` : "00";

  return `${hours}${minutes}${seconds}`;
};

const ProgressBar = () => {
  const { videoRef, progress, bufferedProgress, handleSeek } = useVideoPlayer();

  const currentTime = secondsToHMS(
    (progress * (videoRef.current?.duration ?? 0)) / 100,
  );
  const duration = useMemo(
    () => secondsToHMS(videoRef.current?.duration ?? 0),
    // eslint doesn't understand that videoRef.current?.duration is a dependency of the function and not only videoRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoRef.current?.duration],
  );

  return (
    <div className="flex items-center w-full">
      <div className="relative flex-1 mx-3">
        {/* Background track */}
        <Progress
          className="absolute inset-y-0 left-0 right-0 top-1/2 transform -translate-y-1/2 bg-white/20"
          value={0}
        />

        {/* Buffered progress */}
        <Progress
          className="absolute inset-y-0 left-0 right-0 bg-transparent top-1/2 transform -translate-y-1/2"
          progressClassName="bg-white/40 duration-500"
          value={bufferedProgress}
        />

        {/* Current progress */}
        <Progress
          className="absolute inset-y-0 left-0 right-0 bg-transparent top-1/2 transform -translate-y-1/2"
          progressClassName="transition-none"
          value={progress}
        />

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={(e) => handleSeek(e.target.valueAsNumber)}
          className="absolute inset-y-0 left-0 right-0 top-1/2 transform -translate-y-1/2 accent-primary z-10 cursor-pointer"
        />
      </div>
      <div className="flex items-center">
        {currentTime === null || duration === null ? (
          <Skeleton className="w-[85px] h-[20px]" />
        ) : (
          <Badge>
            <Typography className="font-mono font-bold">
              {currentTime} / {duration}
            </Typography>
          </Badge>
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

const ControlsBar = () => {
  const isMobile = useIsMobile();

  const controlsRef = useRef<HTMLDivElement>(null);
  const { mouseIn } = useMouse(controlsRef);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { playing, mouseMoving, mouseClicked } = useVideoPlayer();

  return (
    <>
      {isMobile && (
        <AnimateApparition
          ref={controlsRef}
          isAnimating={mouseClicked || !playing || settingsOpen}
          animation="fade"
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-black/30">
            <PlayPauseButton
              disabled={!(mouseClicked || !playing || settingsOpen)}
            />
          </div>
          <div className="absolute top-2 right-2 rounded-full bg-black/30">
            <SettingsButton
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              side="bottom"
              disabled={!(mouseClicked || !playing || settingsOpen)}
            />
          </div>
        </AnimateApparition>
      )}
      <AnimateApparition
        ref={controlsRef}
        isAnimating={
          isMobile
            ? mouseClicked || !playing || settingsOpen
            : mouseMoving || mouseClicked || mouseIn || !playing || settingsOpen
        }
        animation="slideToTop"
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="absolute bottom-0 left-0 right-0 p-2"
      >
        <Card className="dark flex flex-row items-center justify-between size-full p-3 bg-black/30">
          {!isMobile && <PlayPauseButton />}
          {!isMobile && <VolumeControl />}
          <ProgressBar />
          {!isMobile && (
            <SettingsButton
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
            />
          )}
          <FullscreenButton />
        </Card>
      </AnimateApparition>
    </>
  );
};

const VideoPlayer = () => {
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const { t } = useTranslation();

  const {
    videoRef,
    containerRef,

    handleKeyDown,

    playing,
    volume,
    togglePlay,
    handleProgress,
    triggerMouseClick,

    resolutions,
    selectedResolution,
    setSelectedResolution,

    selectedSubtitlesLanguage,
  } = useVideoPlayer();

  const isMobile = useIsMobile();

  const { value: middleScreenInfo, setValue: setMiddleScreenInfo } =
    useTimeoutResetState<"volume" | "play" | null>(null, 1000);

  useEffect(() => {
    setMiddleScreenInfo("play");
  }, [playing, setMiddleScreenInfo]);

  useEffect(() => {
    setMiddleScreenInfo("volume");
  }, [volume, setMiddleScreenInfo]);

  useEffect(() => {
    if (!selectedResolution && resolutions.length > 0) {
      setSelectedResolution(resolutions[0]);
    }
  }, []);

  return (
    <div
      tabIndex={0}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="w-full h-[72dvh] bg-black rounded-2xl shadow-lg overflow-hidden relative"
      style={{
        outline: "none",
      }}
      onClick={
        !isMobile
          ? togglePlay
          : (e) => {
              e.stopPropagation();
              triggerMouseClick();
            }
      }
    >
      {selectedResolution ? (
        <>
          <video
            ref={videoRef}
            className="size-full relative"
            onTimeUpdate={handleProgress}
            controls={false}
          >
            <source
              src={getUrl(ROUTES.API.STREAMING_MOVIE_RESOLUTION, {
                tmdbId,
                resolution:
                  selectedResolution.resolution as (typeof ytsQualities)[number],
              })}
              type="video/mp4"
            />
            {selectedSubtitlesLanguage && (
              <track
                src={getUrl(ROUTES.API.STREAMING_MOVIE_SUBTITLES, {
                  tmdbId,
                  subtitlesLanguage:
                    selectedSubtitlesLanguage as keyof typeof languageCodes,
                })}
                kind="subtitles"
                srcLang={selectedSubtitlesLanguage}
                default
              />
            )}
          </video>

          <AnimateApparition
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            animation="fade"
            isAnimating={middleScreenInfo !== null}
          >
            <MiddleScreenInfo type={middleScreenInfo} />
          </AnimateApparition>

          <ControlsBar />
        </>
      ) : (
        <div className="flex items-center justify-center size-full">
          <Typography textColor="muted">
            {t("movie.player.noResolutionSelected")}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

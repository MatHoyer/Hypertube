import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { AppLoader } from "@/components/ui/app-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMouse } from "@/hooks/use-mouse";
import { useTimeoutResetState } from "@/hooks/use-timeout-state-reset";
import { axiosFetch } from "@/lib/fetch/axiosFetch";
import { getQueryKey } from "@/lib/getQueryKey";
import { cn } from "@/lib/utils";
import {
  DownloadStates,
  getStreamingPreviewSchemas,
  getStreamingResolutionSchemas,
  getStreamingSubtitlesSchemas,
  getUrl,
  putMovieWatchTimerSchemas,
  ROUTES,
  secondsToHMS,
} from "@hypertube/libs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Expand, Pause, Play, Shrink, Volume2, VolumeX } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useVideoPlayer } from "../contexts/video-player/video-player.context";
import { MoviePageParamsSchema } from "../schemas/urlParams.schema";
import SettingsButton from "./dropdown-menu-navigating/dropdown-menu-navigating";

const MiddleScreenInfo: React.FC<{
  type: "volume" | "play" | null;
}> = ({ type }) => {
  const { isMobile } = useIsMobile();
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
            <Typography variant="h2" className="text-white">
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
  const { playing, handlePlay } = useVideoPlayer();
  return (
    <Button
      variant="ghost"
      onClick={handlePlay}
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
        {muted ? (
          <VolumeX size={20} color="white" />
        ) : (
          <Volume2 size={20} color="white" />
        )}
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

const Timer = () => {
  const { videoRef, progress } = useVideoPlayer();
  const [currentDuration, setCurrentDuration] = useState(0);

  useEffect(() => {
    if (!videoRef?.current) return;

    const video = videoRef.current;

    const updateDuration = () => {
      setCurrentDuration(video.duration ?? 0);
    };

    updateDuration();

    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("durationchange", updateDuration);

    return () => {
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("durationchange", updateDuration);
    };
  }, [videoRef]);

  const currentTime = secondsToHMS((progress * currentDuration) / 100);
  const duration = useMemo(
    () => secondsToHMS(currentDuration),
    [currentDuration]
  );

  return (
    <div className="flex items-center">
      {currentTime === null || duration === null ? (
        <Skeleton className="w-21.25 h-5" />
      ) : (
        <Badge>
          <Typography className="font-mono font-bold">
            {currentTime} / {duration}
          </Typography>
        </Badge>
      )}
    </div>
  );
};

type TPreview = {
  positionX: number;
  x: number;
  y: number;
  percent: number;
};

const ProgressBar: React.FC<ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const { progress, bufferedProgress, handleSeek, selectedResolution } =
    useVideoPlayer();

  const [preview, setPreview] = useState<TPreview | null>(null);

  const isExplorable = useMemo(() => {
    return (
      selectedResolution &&
      selectedResolution.downloadState === DownloadStates.DOWNLOADED
    );
  }, [selectedResolution]);

  const { data: streamingPreview } = useQuery({
    queryKey: getQueryKey(ROUTES.API.STREAMING_MOVIE_PREVIEW, {
      movieId: tmdbId,
    }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        schemas: getStreamingPreviewSchemas,
        url: getUrl(ROUTES.API.STREAMING_MOVIE_PREVIEW, { tmdbId }),
      }),
    retry: false,
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (!streamingPreview) return;
    const rect = e.currentTarget.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const percent = Math.floor((mouseX / rect.width) * 100);

    const x = percent % streamingPreview.metadata.cols;
    const y = Math.floor(percent / streamingPreview.metadata.rows);

    const positionX = Math.min(
      Math.max(mouseX - streamingPreview.metadata.tileWidth / 2, 0),
      rect.width - streamingPreview.metadata.tileWidth
    );

    setPreview({
      positionX,
      x,
      y,
      percent: percent,
    });
  };

  return (
    <div className={cn("flex items-center w-full", className)} {...props}>
      <div className="relative flex-1">
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

        {preview && streamingPreview && (
          <div
            style={{
              position: "absolute",
              left: preview.positionX,
              top: -(streamingPreview.metadata.tileHeight + 5),
              width: streamingPreview.metadata.tileWidth,
              height: streamingPreview.metadata.tileHeight,
              backgroundImage: `url(${streamingPreview.url})`,
              backgroundPosition: `-${preview.x * streamingPreview.metadata.tileWidth}px -${preview.y * streamingPreview.metadata.tileHeight}px`,
              backgroundSize: `${streamingPreview.metadata.width}px ${streamingPreview.metadata.height}px`,
            }}
          />
        )}

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setPreview(null)}
          onChange={(e) => handleSeek(e.target.valueAsNumber)}
          className={cn(
            "absolute inset-y-0 left-0 right-0 top-1/2 transform -translate-y-1/2 accent-primary z-10",
            !isExplorable ? "cursor-not-allowed" : "cursor-pointer"
          )}
          disabled={!isExplorable}
        />
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
  const { isMobile } = useIsMobile();

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
        className="absolute bottom-0 left-0 right-0"
      >
        <div className="dark flex flex-col gap-3 items-center justify-between size-full bg-linear-to-t from-black/70 to-transparent p-3">
          <ProgressBar />
          <div className="flex flex-row items-center w-full">
            {!isMobile && <PlayPauseButton />}
            {!isMobile && <VolumeControl />}
            <Timer />
            <div className="flex-1" />
            {!isMobile && (
              <SettingsButton
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
              />
            )}
            <FullscreenButton />
          </div>
        </div>
      </AnimateApparition>
    </>
  );
};

const VideoPlayer = () => {
  const { tmdbId } = useConvertParams(MoviePageParamsSchema);
  const { t } = useTranslation();

  const {
    videoRef,
    setVideoRef,
    containerRef,

    handleKeyDown,

    playing,
    volume,
    handlePlay,
    handleProgress,
    triggerMouseClick,

    isResolutionsLoading,
    selectedResolution,
    selectedSubtitlesLanguage,

    progress,
    setWatchedTimestamp,
  } = useVideoPlayer();

  const { isMobile } = useIsMobile();
  const queryClient = useQueryClient();

  const { value: middleScreenInfo, setValue: setMiddleScreenInfo } =
    useTimeoutResetState<"volume" | "play" | null>(null, 1000);

  useEffect(() => {
    setMiddleScreenInfo("play");
  }, [playing, setMiddleScreenInfo]);

  useEffect(() => {
    setMiddleScreenInfo("volume");
  }, [volume, setMiddleScreenInfo]);

  const progressRef = useRef(progress);
  if (progressRef.current === null) progressRef.current = progress;

  const updateWatchTimer = useCallback(() => {
    if (!progressRef.current) return;

    const duration = videoRef.current?.duration ?? 0;
    const timestamp = Math.round((progressRef.current * duration) / 100);

    axiosFetch({
      method: "PUT",
      url: getUrl(ROUTES.API.MOVIES_WATCH_TIMER, { tmdbId }),
      schemas: putMovieWatchTimerSchemas,
      data: {
        duration: Math.round(duration),
        timestamp,
      },
    });

    setWatchedTimestamp(timestamp);
    queryClient.invalidateQueries({
      queryKey: getQueryKey(ROUTES.API.MOVIES_WATCH_TIMER),
    });
  }, [tmdbId, progressRef, videoRef, queryClient, setWatchedTimestamp]);

  useEffect(() => {
    const interval = setInterval(updateWatchTimer, 10000);
    return () => clearInterval(interval);
  }, [updateWatchTimer]);

  useEffect(() => {
    window.addEventListener("beforeunload", updateWatchTimer);

    return () => {
      window.removeEventListener("beforeunload", updateWatchTimer);
    };
  }, [updateWatchTimer]);

  const { data: streamingResolution } = useQuery({
    queryKey: getQueryKey(ROUTES.API.STREAMING_MOVIE_RESOLUTION, {
      movieId: tmdbId,
      resolutionId: selectedResolution?.id ?? "",
    }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        schemas: getStreamingResolutionSchemas,
        url: getUrl(ROUTES.API.STREAMING_MOVIE_RESOLUTION, {
          tmdbId,
          resolutionId: selectedResolution!.id,
        }),
      }),
    enabled: !!selectedResolution,
  });

  const { data: streamingSubtitles } = useQuery({
    queryKey: getQueryKey(ROUTES.API.STREAMING_MOVIE_SUBTITLES, {
      movieId: tmdbId,
      subtitlesLanguage: selectedSubtitlesLanguage ?? "",
    }),
    queryFn: () =>
      axiosFetch({
        method: "GET",
        schemas: getStreamingSubtitlesSchemas,
        url: getUrl(ROUTES.API.STREAMING_MOVIE_SUBTITLES, {
          tmdbId,
          subtitlesLanguage: selectedSubtitlesLanguage!,
        }),
      }),
    enabled: !!selectedSubtitlesLanguage,
  });

  return (
    <div
      tabIndex={0}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="w-full h-[72dvh] bg-black rounded-2xl shadow-lg overflow-hidden relative outline-none"
      onClick={
        !isMobile
          ? handlePlay
          : (e) => {
              e.stopPropagation();
              triggerMouseClick();
            }
      }
    >
      {streamingResolution && selectedResolution ? (
        <>
          <video
            ref={(ref) =>
              ref && !videoRef.current ? setVideoRef(ref) : undefined
            }
            className="size-full relative"
            onTimeUpdate={handleProgress}
            controls={false}
            playsInline
            {...{ "webkit-playsinline": "" }}
            disableRemotePlayback
            crossOrigin="use-credentials"
          >
            <source src={streamingResolution.url} type="video/mp4" />
            {streamingSubtitles && selectedSubtitlesLanguage && (
              <track
                src={streamingSubtitles.url}
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
          {isResolutionsLoading ? (
            <AppLoader />
          ) : (
            <Typography textColor="muted">
              {t("movie.player.noResolutionSelected")}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

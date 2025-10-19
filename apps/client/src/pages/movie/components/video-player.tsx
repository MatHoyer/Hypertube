import AnimateApparition from "@/components/animated/animate-apparition/AnimateApparition";
import { AppLoader } from "@/components/ui/app-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useConvertParams } from "@/hooks/use-convert-params";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMouse } from "@/hooks/use-mouse";
import { useTimeoutResetState } from "@/hooks/use-timeout-state-reset";
import { cn } from "@/lib/utils";
import {
  DownloadStates,
  getUrl,
  languageCodes,
  ytsQualities,
} from "@hypertube/libs";
import {
  Check,
  ChevronLeft,
  Expand,
  Pause,
  PersonStanding,
  Play,
  Rabbit,
  Settings,
  Shrink,
  Squirrel,
  Turtle,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useTranslation } from "react-i18next";
import { MoviePageParamsSchema } from "../schemas/urlParams.schema";
import { useVideoPlayer } from "./video-player.context";

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
  const {
    videoRef,
    progress,
    bufferedProgress,
    handleSeek,
    selectedResolution,
  } = useVideoPlayer();

  const { t } = useTranslation();

  const currentTime = formatTime(
    (progress * (videoRef.current?.duration ?? 0)) / 100
  );
  const duration = useMemo(
    () => formatTime(videoRef.current?.duration ?? 0),
    [videoRef]
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
          value={progress > 50 ? progress - 1 : progress + 1}
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

        {selectedResolution?.downloadState !== DownloadStates.DOWNLOADED && (
          <div className="absolute z-10 inset-0 flex items-center justify-center gap-2 bg-black/70">
            <AppLoader color="orange" />
            <Typography variant="muted">
              {t("movie.player.resolutionDownloading")}
            </Typography>
          </div>
        )}
      </div>
      <div className="flex items-center">
        {currentTime === null || duration === null ? (
          <Skeleton className="w-[85px] h-[20px]" />
        ) : (
          <Badge>
            <Typography variant="mono" className="font-bold">
              {currentTime} / {duration}
            </Typography>
          </Badge>
        )}
      </div>
    </div>
  );
};

const GlobalSettings: React.FC<{
  setType: (type: "speed" | "resolutions" | "subtitles") => void;
}> = ({ setType }) => {
  const { t } = useTranslation();

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setType("speed");
          }}
        >
          {t("movie.playerSettings.readingSpeed")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setType("resolutions");
          }}
        >
          {t("movie.playerSettings.resolutions")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            setType("subtitles");
          }}
        >
          {t("movie.playerSettings.subtitles")}
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </>
  );
};

const DropdownMenuSelectedItem: React.FC<{
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ selected, onClick, icon, children }) => {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <Check className={cn(!selected && "invisible")} />
        {children}
      </div>
      {icon}
    </DropdownMenuItem>
  );
};

const SpeedSettings: React.FC<{
  goBack: () => void;
  closePopup: () => void;
}> = ({ goBack, closePopup }) => {
  const { t } = useTranslation();
  const { speed, handleSetSpeed } = useVideoPlayer();

  const handleClick = (speed: 0.5 | 1 | 1.5 | 2) => {
    handleSetSpeed(speed);
    closePopup();
  };

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <button className="rounded-full cursor-pointer" onClick={goBack}>
          <ChevronLeft size={20} />
        </button>
        {t("movie.playerSettings.readingSpeed")}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuSelectedItem
          onClick={() => handleClick(0.5)}
          selected={speed === 0.5}
          icon={<Turtle />}
        >
          <Typography>0.5</Typography>
        </DropdownMenuSelectedItem>
        <DropdownMenuSelectedItem
          onClick={() => handleClick(1)}
          selected={speed === 1}
          icon={<PersonStanding />}
        >
          <Typography>1</Typography>
        </DropdownMenuSelectedItem>
        <DropdownMenuSelectedItem
          onClick={() => handleClick(1.5)}
          selected={speed === 1.5}
          icon={<Squirrel />}
        >
          <Typography>1.5</Typography>
        </DropdownMenuSelectedItem>
        <DropdownMenuSelectedItem
          onClick={() => handleClick(2)}
          selected={speed === 2}
          icon={<Rabbit />}
        >
          <Typography>2</Typography>
        </DropdownMenuSelectedItem>
      </DropdownMenuGroup>
    </>
  );
};

const ResolutionsSettings: React.FC<{
  goBack: () => void;
  closePopup: () => void;
}> = ({ goBack, closePopup }) => {
  const { t } = useTranslation();
  const { resolutions, selectedResolution, setSelectedResolution } =
    useVideoPlayer();

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <button className="rounded-full cursor-pointer" onClick={goBack}>
          <ChevronLeft size={20} />
        </button>
        {t("movie.playerSettings.resolutions")}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {resolutions.length > 0 ? (
          resolutions.map((resolution, index) => (
            <DropdownMenuSelectedItem
              key={index}
              onClick={() => {
                setSelectedResolution(resolution);
                closePopup();
              }}
              selected={
                selectedResolution?.resolution === resolution.resolution
              }
              icon={
                resolution.downloadState === DownloadStates.DOWNLOADED ? (
                  <Check size={20} color="green" />
                ) : (
                  <AppLoader color="orange" />
                )
              }
            >
              {resolution.resolution}
            </DropdownMenuSelectedItem>
          ))
        ) : (
          <Typography variant="muted" className="p-2">
            {t("movie.playerSettings.noResolutions")}
          </Typography>
        )}
      </DropdownMenuGroup>
    </>
  );
};

const SubtitlesSettings: React.FC<{
  goBack: () => void;
  closePopup: () => void;
}> = ({ goBack, closePopup }) => {
  const { t } = useTranslation();
  const { subtitles, selectedSubtitlesLanguage, setSelectedSubtitlesLanguage } =
    useVideoPlayer();

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <button className="rounded-full cursor-pointer" onClick={goBack}>
          <ChevronLeft size={20} />
        </button>
        {t("movie.playerSettings.subtitles")}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        {subtitles.length > 0 && (
          <DropdownMenuSelectedItem
            onClick={() => {
              setSelectedSubtitlesLanguage(null);
              closePopup();
            }}
            selected={selectedSubtitlesLanguage === null}
            icon={null}
          >
            {t("movie.playerSettings.noSelectedSubtitles")}
          </DropdownMenuSelectedItem>
        )}
        {subtitles.length > 0 ? (
          subtitles.map((subtitle, index) => (
            <DropdownMenuSelectedItem
              key={index}
              onClick={() => {
                setSelectedSubtitlesLanguage(subtitle.language);
                closePopup();
              }}
              selected={selectedSubtitlesLanguage === subtitle.language}
              icon={
                subtitle.downloadState === DownloadStates.DOWNLOADED ? (
                  <Check size={20} color="green" />
                ) : (
                  <AppLoader color="orange" />
                )
              }
            >
              {subtitle.language}
            </DropdownMenuSelectedItem>
          ))
        ) : (
          <Typography variant="muted" className="p-2">
            {t("movie.playerSettings.noSubtitles")}
          </Typography>
        )}
      </DropdownMenuGroup>
    </>
  );
};

const SettingsButton: React.FC<
  {
    settingsOpen: boolean;
    setSettingsOpen: (settingsOpen: boolean) => void;
    side?: "top" | "bottom";
  } & ComponentProps<typeof Button>
> = ({ settingsOpen, setSettingsOpen, side = "top", className, ...props }) => {
  const [type, setType] = useState<
    "global" | "speed" | "resolutions" | "subtitles"
  >("global");

  const closePopup = () => {
    setSettingsOpen(false);
    setTimeout(() => {
      setType("global");
    }, 100);
  };
  const goGlobal = () => {
    setType("global");
  };
  const { containerRef } = useVideoPlayer();

  return (
    <DropdownMenu
      open={settingsOpen}
      onOpenChange={(open) => {
        setSettingsOpen(open);
        if (!open) goGlobal();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("p-2 rounded-full", className)}
          {...props}
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={20} color="white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align="end"
        container={containerRef.current ?? undefined}
      >
        {(() => {
          switch (type) {
            case "global":
              return <GlobalSettings setType={(type) => setType(type)} />;
            case "speed":
              return (
                <SpeedSettings goBack={goGlobal} closePopup={closePopup} />
              );
            case "resolutions":
              return (
                <ResolutionsSettings
                  goBack={goGlobal}
                  closePopup={closePopup}
                />
              );
            case "subtitles":
              return (
                <SubtitlesSettings goBack={goGlobal} closePopup={closePopup} />
              );
          }
        })()}
      </DropdownMenuContent>
    </DropdownMenu>
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
      ref={containerRef}
      className="w-full h-[72dvh] bg-black rounded-2xl shadow-lg overflow-hidden relative"
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
              src={getUrl("api-streaming-movie-resolution", {
                tmdbId,
                resolution:
                  selectedResolution.resolution as (typeof ytsQualities)[number],
              })}
              type="video/mp4"
            />
            {selectedSubtitlesLanguage && (
              <track
                src={getUrl("api-streaming-movie-subtitles", {
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
          <Typography variant="muted">
            {t("movie.player.noResolutionSelected")}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

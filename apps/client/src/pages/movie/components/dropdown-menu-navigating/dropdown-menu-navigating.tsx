import { AppLoader } from "@/components/ui/app-loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { DownloadStates } from "@hypertube/libs";
import {
  Check,
  PersonStanding,
  Rabbit,
  Settings,
  Squirrel,
  Turtle,
} from "lucide-react";
import { useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { useResolutions } from "../../contexts/resolutions/resolutions.context";
import { useSubtitles } from "../../contexts/subtitles/subtitles.context";
import { useVideoPlayer } from "../../contexts/video-player/video-player.context";
import {
  DropdownMenuNavigatingPage,
  DropdownMenuSelectedItem,
} from "./dropdown-menu-navigating.helpers";

const GlobalSettings: React.FC<{
  setType: (type: "speed" | "resolutions" | "subtitles") => void;
}> = ({ setType }) => {
  const { t } = useTranslation();

  return (
    <DropdownMenuNavigatingPage title={t("movie.playerSettings.settings")}>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setType("speed");
        }}
      >
        {t("movie.playerSettings.readingSpeed")}
      </DropdownMenuItem>
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
    </DropdownMenuNavigatingPage>
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
    <DropdownMenuNavigatingPage
      title={t("movie.playerSettings.readingSpeed")}
      goBack={goBack}
    >
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
    </DropdownMenuNavigatingPage>
  );
};

const ResolutionsSettings: React.FC<{
  goBack: () => void;
  closePopup: () => void;
}> = ({ goBack, closePopup }) => {
  const { t } = useTranslation();
  const { streamableResolutions } = useResolutions();
  const { selectedResolution, setSelectedResolution } = useVideoPlayer();

  return (
    <DropdownMenuNavigatingPage
      title={t("movie.playerSettings.resolutions")}
      goBack={goBack}
    >
      {streamableResolutions.length > 0 ? (
        streamableResolutions.map((resolution, index) => (
          <DropdownMenuSelectedItem
            key={index}
            onClick={() => {
              setSelectedResolution(resolution);
              closePopup();
            }}
            selected={selectedResolution?.resolution === resolution.resolution}
            icon={
              resolution.downloadState === DownloadStates.DOWNLOADED ? (
                <Check color="green" />
              ) : (
                <AppLoader color="orange" />
              )
            }
          >
            {resolution.resolution}
          </DropdownMenuSelectedItem>
        ))
      ) : (
        <Typography textColor="muted" className="p-2">
          {t("movie.playerSettings.noResolutions")}
        </Typography>
      )}
    </DropdownMenuNavigatingPage>
  );
};

const SubtitlesSettings: React.FC<{
  goBack: () => void;
  closePopup: () => void;
}> = ({ goBack, closePopup }) => {
  const { t } = useTranslation();
  const { streamableSubtitles } = useSubtitles();
  const { selectedSubtitlesLanguage, setSelectedSubtitlesLanguage } =
    useVideoPlayer();

  return (
    <DropdownMenuNavigatingPage
      title={t("movie.playerSettings.subtitles")}
      goBack={goBack}
    >
      {streamableSubtitles.length > 0 && (
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
      {streamableSubtitles.length > 0 ? (
        streamableSubtitles.map((subtitle, index) => (
          <DropdownMenuSelectedItem
            key={index}
            onClick={() => {
              setSelectedSubtitlesLanguage(subtitle.language);
              closePopup();
            }}
            selected={selectedSubtitlesLanguage === subtitle.language}
            icon={
              subtitle.downloadState === DownloadStates.DOWNLOADED ? (
                <Check color="green" />
              ) : (
                <AppLoader color="orange" />
              )
            }
          >
            <Typography className="w-full truncate">
              {subtitle.language}
            </Typography>
          </DropdownMenuSelectedItem>
        ))
      ) : (
        <Typography textColor="muted" className="p-2">
          {t("movie.playerSettings.noSubtitles")}
        </Typography>
      )}
    </DropdownMenuNavigatingPage>
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

  const renderPage = () => {
    switch (type) {
      case "global":
        return <GlobalSettings setType={(type) => setType(type)} />;
      case "speed":
        return <SpeedSettings goBack={goGlobal} closePopup={closePopup} />;
      case "resolutions":
        return (
          <ResolutionsSettings goBack={goGlobal} closePopup={closePopup} />
        );
      case "subtitles":
        return <SubtitlesSettings goBack={goGlobal} closePopup={closePopup} />;
    }
  };

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
          <Settings color="white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={side}
        align="end"
        container={containerRef.current ?? undefined}
      >
        {renderPage()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsButton;

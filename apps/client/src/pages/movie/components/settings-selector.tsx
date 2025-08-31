import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { type TGetYtsMovieDataSchemas } from "@hypertube/libs";
import { useTranslation } from "react-i18next";

export const SettingsSelector: React.FC<{
  resolutions: TGetYtsMovieDataSchemas["response"]["resolutions"];
  selectedResolution: string | null;
  setSelectedResolution: (resolution: string) => void;
  subtitlesLanguages: TGetYtsMovieDataSchemas["response"]["subtitles"];
  selectedSubtitlesLanguage: string | null;
  setSelectedSubtitlesLanguage: (subtitlesLanguage: string) => void;
}> = ({
  resolutions,
  selectedResolution,
  setSelectedResolution,
  subtitlesLanguages,
  selectedSubtitlesLanguage,
  setSelectedSubtitlesLanguage,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>{t("movie.settingsPage.title")}</CardTitle>
        <CardDescription>{t("movie.settingsPage.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("movie.settingsPage.resolutions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {resolutions.length > 0 ? (
              <div className="flex justify-start gap-2 flex-wrap">
                {resolutions.map((resolution) => (
                  <Button
                    key={resolution.resolution}
                    onClick={() => setSelectedResolution(resolution.resolution)}
                    variant={
                      selectedResolution === resolution.resolution
                        ? "default"
                        : "outline"
                    }
                  >
                    {resolution.resolution}
                  </Button>
                ))}
              </div>
            ) : (
              <Typography>{t("movie.settingsPage.noResolutions")}</Typography>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("movie.settingsPage.subtitles")}</CardTitle>
          </CardHeader>
          <CardContent>
            {subtitlesLanguages.length > 0 ? (
              <div className="flex justify-start gap-2 flex-wrap">
                {subtitlesLanguages.map((subtitlesLanguage) => (
                  <Button
                    key={subtitlesLanguage.language}
                    onClick={() =>
                      setSelectedSubtitlesLanguage(subtitlesLanguage.language)
                    }
                    variant={
                      selectedSubtitlesLanguage === subtitlesLanguage.language
                        ? "default"
                        : "outline"
                    }
                  >
                    {subtitlesLanguage.language}
                  </Button>
                ))}
              </div>
            ) : (
              <Typography>{t("movie.settingsPage.noSubtitles")}</Typography>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { type TGetYtsMovieDataSchemas } from "@hypertube/libs";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const DownloadsSelector: React.FC<{
  resolutions: TGetYtsMovieDataSchemas["response"]["resolutions"];
  subtitlesLanguages: TGetYtsMovieDataSchemas["response"]["subtitles"];
}> = ({ resolutions, subtitlesLanguages }) => {
  const { t } = useTranslation();
  const [selectedResolution, setSelectedResolution] = useState<string | null>(
    null
  );
  const [selectedSubtitlesLanguage, setSelectedSubtitlesLanguage] = useState<
    string | null
  >(null);

  return (
    <Card className="size-full">
      <CardHeader>
        <CardTitle>{t("movie.downloadPage.title")}</CardTitle>
        <CardDescription>{t("movie.downloadPage.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("movie.downloadPage.resolutions")}</CardTitle>
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
              <Typography>{t("movie.downloadPage.noResolutions")}</Typography>
            )}
          </CardContent>
          <CardFooter>
            <Button disabled={!selectedResolution}>
              {t("movie.downloadPage.download")}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("movie.downloadPage.subtitles")}</CardTitle>
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
              <Typography>{t("movie.downloadPage.noSubtitles")}</Typography>
            )}
          </CardContent>
          <CardFooter>
            <Button disabled={!selectedSubtitlesLanguage}>
              {t("movie.downloadPage.download")}
            </Button>
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
};

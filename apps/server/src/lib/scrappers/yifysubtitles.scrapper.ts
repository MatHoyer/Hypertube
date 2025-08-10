import puppeteer from "puppeteer";

const yifysubtitlesUrl = "https://yifysubtitles.ch/movie-imdb/";

// Movie id is like: tt0816692
export const getSubtitlesDownloadLinks = async ({
  endpoint,
  isCompleteUrl = false,
}: {
  endpoint: string;
  isCompleteUrl?: boolean;
}) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(isCompleteUrl ? endpoint : `${yifysubtitlesUrl}${endpoint}`);

  const trs = await page.$$("tr");

  const subtitlesDownloadLinks = await Promise.all(
    trs.map(async (tr) => {
      const tds = await tr.$$("td");
      if (tds.length < 5) return null;

      const rating = parseInt(
        await tds[0].$eval("span.label", (el) => el.textContent ?? "0")
      );
      if (rating < 1) return null;

      const language = await tds[1].$eval(
        "span.sub-lang",
        (el) => el.textContent
      );
      const link = await tds[2].$eval("a", (el) => el.href);

      return {
        language,
        rating: rating,
        link,
      };
    })
  );

  await browser.close();

  return subtitlesDownloadLinks.filter(
    (
      subtitle
    ): subtitle is { language: string; rating: number; link: string } =>
      !!subtitle && !!subtitle.link && !!subtitle.language && !!subtitle.rating
  );
};

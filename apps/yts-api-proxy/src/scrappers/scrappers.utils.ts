import puppeteer from "puppeteer";

export const launchPuppeteer = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return browser;
};

import puppeteer, { type Browser, type LaunchOptions } from "puppeteer-core";
import { existsSync } from "node:fs";
import { isServerless } from "@/lib/utils";

const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

export async function launchBrowser(): Promise<Browser> {
  if (isServerless()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const opts: LaunchOptions = {
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    };
    return puppeteer.launch(opts);
  }

  const local = LOCAL_CHROME_PATHS.find((p) => existsSync(p));
  if (local) {
    return puppeteer.launch({ executablePath: local, headless: true });
  }

  // Fallback: use sparticuz chromium locally too. Slower first run while it extracts.
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

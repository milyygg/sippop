import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("qa", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
await page.goto("http://127.0.0.1:5173/");
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("sippop-theme", "light");
});
await page.reload();
await page.evaluate(() => document.fonts.ready);
await page.locator(".hero-product").evaluate((i) => i.decode());
await page.screenshot({ path: "qa/desktop-fold.png" });
const headings = [];
for (const lang of ["ru", "en"]) {
  if (lang === "en")
    await page.getByRole("button", { name: "Switch to English" }).click();
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    headings.push({
      lang,
      width,
      headings: await page.locator("h1,h2").evaluateAll((list) =>
        list.map((el) => {
          const s = getComputedStyle(el);
          return {
            text: el.textContent,
            lines: Math.round(
              (el.clientHeight -
                parseFloat(s.paddingTop) -
                parseFloat(s.paddingBottom)) /
                parseFloat(s.lineHeight),
            ),
          };
        }),
      ),
    });
  }
}
await page.setViewportSize({ width: 768, height: 1024 });
await page.screenshot({ path: "qa/tablet-fold.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "Переключить на русский" }).click();
await page.screenshot({ path: "qa/mobile-fold.png" });
await page.getByRole("button", { name: "Сменить тему" }).click();
await page.screenshot({ path: "qa/mobile-dark-fold.png" });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: "qa/desktop-dark-fold.png" });
await page.getByRole("button", { name: "Сменить тему" }).click();
await page.setViewportSize({ width: 1200, height: 630 });
await page.screenshot({ path: "public/assets/og-cover.png" });
await writeFile("qa/heading-layout.json", JSON.stringify(headings, null, 2));
await browser.close();
console.log("Visual QA screenshots saved");

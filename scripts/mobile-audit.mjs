// Mobile/desktop visual audit for the landing page.
// Usage: node scripts/mobile-audit.mjs [outDir]
// Requires a dev server on http://localhost:3000 (pnpm dev),
// or set AUDIT_BASE_URL.
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = process.argv[2] ?? "notes/screenshots/latest";
const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";

const VIEWPORTS = [
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: "desktop", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
];
const LOCALES = ["en", "zh"];

const browser = await chromium.launch();
const report = [];

for (const { name, ...opts } of VIEWPORTS) {
  for (const locale of LOCALES) {
    const context = await browser.newContext(opts);
    const page = await context.newPage();
    await page.goto(`${BASE}/${locale}`, { waitUntil: "networkidle" });
    // Let intro animations settle.
    await page.waitForTimeout(3500);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    report.push({ viewport: name, locale, ...metrics, overflowX: metrics.scrollWidth > metrics.innerWidth });

    const dir = path.join(outDir, name, locale);
    await mkdir(dir, { recursive: true });

    // Scroll step by step (~90% of a viewport per step), screenshot each stop.
    const step = Math.round(metrics.innerHeight * 0.9);
    const stops = Math.ceil(metrics.scrollHeight / step);
    for (let i = 0; i < stops; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), i * step);
      await page.waitForTimeout(700); // let scroll-driven animations catch up
      await page.screenshot({ path: path.join(dir, `${String(i).padStart(2, "0")}.png`) });
    }
    await context.close();
  }
}

await browser.close();
console.table(report);
const bad = report.filter((r) => r.overflowX);
if (bad.length) {
  console.error("HORIZONTAL OVERFLOW detected:", bad);
  process.exitCode = 1;
} else {
  console.log("No horizontal overflow. Screenshots in", outDir);
}

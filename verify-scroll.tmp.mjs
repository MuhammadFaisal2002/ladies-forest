import { chromium } from "playwright";

const DIR =
  "C:\\Users\\DELL\\AppData\\Local\\Temp\\claude\\d--faisal97-fashion\\8208c47d-7568-44c8-a222-02a0184725ff\\scratchpad";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
});

await page.goto("http://localhost:3000/", {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});
await page.waitForTimeout(1500);

// Scroll like a user: one viewport at a time, letting reveals play
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(450);
}
await page.waitForTimeout(800);

// Any content still hidden after full scroll?
const hidden = await page.evaluate(() => {
  let count = 0;
  const offenders = [];
  for (const el of document.querySelectorAll("main section *")) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (cs.opacity === "0" && r.width > 50 && r.height > 50) {
      count++;
      if (offenders.length < 5)
        offenders.push(`${el.tagName}.${String(el.className).slice(0, 40)}`);
    }
  }
  return { count, offenders };
});
console.log("still-hidden elements after scroll:", JSON.stringify(hidden));

// Viewport shots at key positions
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(900);
await page.screenshot({ path: `${DIR}\\mob-home-mid.png` });
await page.evaluate(() =>
  window.scrollTo(0, document.body.scrollHeight - 900),
);
await page.waitForTimeout(900);
await page.screenshot({ path: `${DIR}\\mob-home-bottom.png` });
console.log("shots saved");
await browser.close();

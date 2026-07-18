import { chromium } from "playwright";

const DIR =
  "C:\\Users\\DELL\\AppData\\Local\\Temp\\claude\\d--faisal97-fashion\\8208c47d-7568-44c8-a222-02a0184725ff\\scratchpad";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

const overflowCheck = () =>
  page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - window.innerWidth;
    // find widest offender if any
    let worst = null;
    if (overflow > 1) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 1 || r.left < -1) {
          const w = r.right - Math.min(r.left, 0);
          if (!worst || w > worst.w)
            worst = {
              w,
              tag: el.tagName,
              cls: String(el.className).slice(0, 60),
            };
        }
      }
    }
    return { overflow, worst };
  });

async function check(url, name, extra) {
  await page.goto(`http://localhost:3000${url}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(1800);
  if (extra) await extra();
  const res = await overflowCheck();
  await page.screenshot({ path: `${DIR}\\mob-${name}.png`, fullPage: true });
  console.log(
    `${name.padEnd(12)} overflow=${res.overflow}px`,
    res.worst ? JSON.stringify(res.worst) : "",
  );
}

await check("/", "home");
await check("/shop", "shop");
await check("/category/bras", "category");
await check(
  "/product/soft-cotton-light-padded-bra-skinny",
  "product",
);

// add to cart -> mini cart sheet
await page.click('button:has-text("Add to cart")');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${DIR}\\mob-minicart.png` });
console.log("minicart     shot taken");
// close sheet via Escape
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

await check("/cart", "cart");
await check("/checkout", "checkout");
await check("/order/LF-1001", "order");
await check("/contact", "contact");

// mobile nav (hamburger)
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
const burger = page
  .locator(
    'header button[aria-label*="menu" i], header button[aria-label*="navigation" i]',
  )
  .first();
if (await burger.count()) {
  await burger.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}\\mob-nav.png` });
  console.log("mobile nav   opened + shot");
} else {
  console.log("mobile nav   NO HAMBURGER FOUND");
}

console.log("page errors:", errors.length ? errors.slice(0, 5) : "none");
await browser.close();

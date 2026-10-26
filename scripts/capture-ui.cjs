const {
  chromium,
} = require("C:/Users/AI/AppData/Local/Programs/Codex-Offline-CN/browser-runtime/node_modules/playwright");
const path = require("node:path");
const fs = require("node:fs");
(async () => {
  const root = path.join(process.cwd(), "evidence");
  fs.mkdirSync(root, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1536, height: 1024 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(root, "review-initial.png"),
    fullPage: true,
  });
  console.log(
    JSON.stringify({
      title: await page.title(),
      heading: await page.locator("h1").innerText(),
      exportDisabled: await page
        .getByRole("button", { name: "导出", exact: true })
        .isDisabled(),
      errors,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    }),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

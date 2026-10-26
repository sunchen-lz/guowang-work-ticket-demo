const {
  chromium,
} = require("C:/Users/AI/AppData/Local/Programs/Codex-Offline-CN/browser-runtime/node_modules/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
(async () => {
  const output = path.join(process.cwd(), "evidence");
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1536, height: 1024 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
  });
  const errors = [],
    external = [],
    checks = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:4173") &&
      !r.url().startsWith("blob:") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  const check = (name, condition) => {
    assert.ok(condition, name);
    checks.push(name);
  };
  const button = (name) => page.getByRole("button", { name, exact: true });
  const nav = (name) =>
    page.getByRole("navigation").getByRole("button", { name, exact: true });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.mouse.move(1520, 1000);
  await page.screenshot({ path: path.join(output, "review-final.png") });
  check("initial review export is blocked", await button("导出").isDisabled());
  check(
    "correct navigation selected",
    (await nav("工作票生成").getAttribute("aria-current")) === "page",
  );
  await button("下一页").click();
  check(
    "document second page works",
    (await page.locator(".paper h2").innerText()) === "人员信息",
  );
  await button("上一页").click();
  await button("放大").click();
  check(
    "document zoom works",
    (await page.locator(".zoom-value").innerText()) === "125%",
  );
  await button("适应页面").click();
  await button("来源依据").click();
  check(
    "source provenance is visible",
    await button("查看规则详情").isVisible(),
  );
  await button("字段核对").click();
  await page.getByRole("checkbox").check();
  check("separate review unlocks export", await button("导出").isEnabled());
  await button("导出").click();
  const downloadWait = page.waitForEvent("download");
  await button("下载演示 JSON").click();
  const download = await downloadWait;
  const exported = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
  check(
    "download marked demo, not formal ticket",
    exported.kind === "interface-demo-only" && exported.formalTicket === false,
  );
  await nav("历史票据").click();
  check("export recorded in history", (await button("查看记录").count()) === 1);
  await button("查看记录").click();
  await button("关闭弹窗").click();
  await nav("工作票生成").click();
  await button("修改字段").first().click();
  await page
    .getByRole("textbox", { name: "修改作业名称", exact: true })
    .fill("修改后的示例任务");
  await button("保存修改").click();
  check(
    "edit forces field confirmation screen",
    (await page.locator("h1").innerText()) === "新建工作票",
  );
  await page.getByRole("textbox", { name: "工作负责人", exact: true }).fill("");
  await button("确认字段并校验").click();
  check(
    "missing required field blocks review",
    await button("进入文档复核").isDisabled(),
  );
  check(
    "missing field explained",
    await page.getByText("请补充工作负责人", { exact: true }).isVisible(),
  );
  await button("返回字段确认").click();
  await page
    .getByRole("textbox", { name: "工作负责人", exact: true })
    .fill("示例负责人");
  await button("确认字段并校验").click();
  await button("进入文档复核").click();
  check(
    "review reset after changes",
    !(await page.getByRole("checkbox").isChecked()) &&
      (await button("导出").isDisabled()),
  );
  await nav("规则审核").click();
  await page.screenshot({ path: path.join(output, "rules.png") });
  await button("停用").click();
  await nav("工作票生成").click();
  await button("确认字段并校验").click();
  check("disabled rules block flow", await button("进入文档复核").isDisabled());
  await nav("规则审核").click();
  await button("启用").click();
  await button("审核详情").click();
  check(
    "review details need audit fields",
    await button("记录演示审核").isDisabled(),
  );
  await page.getByLabel("演示审核人", { exact: true }).fill("演示审核员");
  await page.getByRole("checkbox").check();
  await button("记录演示审核").click();
  check(
    "review records new rule state",
    (await button("审核详情").count()) === 0,
  );
  await nav("资料管理").click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "新增演示资料.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("demo metadata only"),
    });
  await page.getByText("新增演示资料.pdf").waitFor();
  check(
    "file registered pending, no parsing",
    await page.getByText("新增演示资料.pdf").isVisible(),
  );
  await page.getByPlaceholder("搜索资料名称…").fill("不存在");
  await page
    .getByText("没有匹配的资料，试试其他关键词。", { exact: true })
    .waitFor();
  check(
    "material empty search state",
    await page
      .getByText("没有匹配的资料，试试其他关键词。", { exact: true })
      .isVisible(),
  );
  await page.getByPlaceholder("搜索资料名称…").fill("");
  await page.screenshot({ path: path.join(output, "materials.png") });
  await nav("模板管理").click();
  await button("字段映射").first().click();
  check(
    "template mapping dialog opens",
    await page.getByRole("dialog").isVisible(),
  );
  await page.keyboard.press("Escape");
  await button("新建草稿").last().click();
  check(
    "live work grouping preserved",
    (await page.getByLabel("票种分组").inputValue()) === "live",
  );
  await button("自然语言").click();
  await page
    .getByLabel("描述作业任务")
    .fill("地点为演示线路9号杆，计划时间2026-10-28。");
  await button("提取演示字段").click();
  check(
    "literal demo extraction works",
    (await page
      .getByRole("textbox", { name: "作业地点", exact: true })
      .inputValue()) === "演示线路9号杆",
  );
  await button("填入演示样例").click();
  await button("保存草稿").click();
  await nav("历史票据").click();
  check(
    "saved draft can be continued",
    (await button("继续填写").count()) === 1,
  );
  await button("继续填写").click();
  await nav("本地设置").click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "sample-model.gguf",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("metadata only"),
    });
  await button("保存设置").click();
  await page.screenshot({ path: path.join(output, "settings.png") });
  await nav("历史票据").click();
  await nav("本地设置").click();
  check(
    "model filename retained during session",
    await page.getByText("sample-model.gguf", { exact: true }).isVisible(),
  );
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  for (const [width, height, name] of [
    [1280, 800, "review-1280"],
    [390, 844, "review-mobile"],
  ]) {
    await page.setViewportSize({ width, height });
    await page.mouse.move(width - 2, height - 2);
    await page.screenshot({
      path: path.join(output, name + ".png"),
      fullPage: true,
    });
    check(
      name + " has no page horizontal overflow",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    check(
      name + " review checkbox reachable",
      await page.getByRole("checkbox").isVisible(),
    );
    if (width > 980) {
      const box = await button("导出").boundingBox();
      check(
        name + " export fully visible above footer",
        box.y + box.height <= height - 69,
      );
    }
  }
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.mouse.move(1520, 1000);
  await page.screenshot({ path: path.join(output, "review-final.png") });
  check("no browser errors", errors.length === 0);
  check("no external network requests", external.length === 0);
  fs.writeFileSync(
    path.join(output, "browser-verification.json"),
    JSON.stringify(
      {
        checks,
        errors,
        external,
        result: "passed",
        browser: "isolated headless Microsoft Edge",
        viewport: [1536, 1024],
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      checks: checks.length,
      errors,
      external,
      result: "passed",
    }),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

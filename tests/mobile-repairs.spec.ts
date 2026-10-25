import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    for (const api of [DeviceOrientationEvent, DeviceMotionEvent]) {
      Object.defineProperty(api, "requestPermission", {
        configurable: true,
        value: undefined,
      });
    }
  });
});

test("gravity fallback handles Android with no orientation readings", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await expect(page.locator(".hero-product-float")).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 8, z: 5 },
      }),
    ),
  );
  await expect(page.locator(".tilt-controls")).toContainText("движется вместе");
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: -4, y: 8, z: 5 },
      }),
    ),
  );
  await expect
    .poll(() =>
      page
        .locator(".hero-product-parallax")
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBeGreaterThan(2);
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 4, y: 8, z: 5 },
      }),
    ),
  );
  await expect
    .poll(() =>
      page
        .locator(".hero-product-parallax")
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    )
    .toBeLessThan(-2);
});

test("silent sensors show actionable feedback instead of claiming tilt works", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  await expect(page.locator(".tilt-controls")).toContainText(
    "Браузер не передаёт данные наклона",
    { timeout: 8000 },
  );
  await expect(
    page.getByRole("button", { name: "Включить наклон телефона" }),
  ).toBeVisible();
});

test("motion-only permission is requested from the user gesture", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() =>
    Object.defineProperty(DeviceMotionEvent, "requestPermission", {
      configurable: true,
      value: () => {
        document.documentElement.dataset.motionPermission = "requested";
        return Promise.resolve("granted");
      },
    }),
  );
  await page.goto("./");
  await expect(
    page.getByRole("button", { name: "Включить наклон телефона" }),
  ).toBeVisible();
  expect(
    await page.locator("html").getAttribute("data-motion-permission"),
  ).toBeNull();
  await page.getByRole("button", { name: "Включить наклон телефона" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-motion-permission",
    "requested",
  );
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 8, z: 5 },
      }),
    ),
  );
  await expect(page.locator(".tilt-controls")).toContainText("движется вместе");
});

test("vertical and diagonal finger gestures over drink images scroll the page", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  const cdp = await page.context().newCDPSession(page);
  const image = page.locator(".flavor-card img").first();
  await image.scrollIntoViewIfNeeded();
  await expect(page.locator(".flavor-grid")).toHaveCSS("display", "flex");
  const box = await image.boundingBox();
  if (!box) throw new Error("Missing drink image");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const before = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let step = 1; step <= 6; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - step * 3, y: y - step * 35 }],
    });
    await page.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before + 100);
  expect(
    await page
      .locator(".flavor-grid")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#flavors").scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("flavors-mobile.png") });
});

test("hero preload matches the only selected image and stays below 250 KB", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const downloads: string[] = [];
  page.on("request", (request) => {
    if (/hero-strawberry.*\.webp/.test(request.url()))
      downloads.push(request.url());
  });
  await page.goto("./");
  const hero = page.locator(".hero-product");
  await hero.evaluate(async (el) => (el as HTMLImageElement).decode());
  const url = await hero.evaluate((el) => (el as HTMLImageElement).currentSrc);
  const response = await page.request.get(url);
  expect((await response.body()).length).toBeLessThan(250_000);
  expect(downloads).toHaveLength(1);
});

test("carousel swipes sideways and tilt button is visible without a permission API", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("./");
  const button = page.getByRole("button", { name: "Включить наклон телефона" });
  await expect(button).toBeInViewport();
  await button.click();
  await expect(button).toBeEnabled();
  await page.evaluate(() =>
    window.dispatchEvent(
      new DeviceMotionEvent("devicemotion", {
        accelerationIncludingGravity: { x: 0, y: 8, z: 5 },
      }),
    ),
  );
  await expect(page.locator(".tilt-controls")).toContainText("движется вместе");
  const grid = page.locator(".flavor-grid");
  await grid.scrollIntoViewIfNeeded();
  const box = await grid.boundingBox();
  if (!box) throw new Error("Missing carousel");
  const cdp = await page.context().newCDPSession(page);
  const x = box.x + box.width * 0.8,
    y = Math.max(80, box.y + 150);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - i * 25, y: y - i * 2 }],
    });
    await page.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => grid.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(100);
  const beforeVertical = await page.evaluate(() => scrollY);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 180, y }],
  });
  for (let i = 1; i <= 7; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 180, y: y - i * 30 }],
    });
    await page.waitForTimeout(30);
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(beforeVertical + 100);
});

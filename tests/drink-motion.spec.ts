import { test, expect } from "@playwright/test";

test.describe("phone drink motion", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });

  test("sensor permission is requested only on click and tilt follows both directions", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
        configurable: true,
        value: () => {
          document.documentElement.dataset.permissionCalls = String(
            Number(document.documentElement.dataset.permissionCalls ?? 0) + 1,
          );
          return Promise.resolve("granted");
        },
      });
    });
    await page.goto("./");
    await expect(page.locator(".hero-product-float")).toHaveCSS(
      "animation-name",
      "float",
    );
    expect(
      await page.locator("html").getAttribute("data-permission-calls"),
    ).toBeNull();
    await page
      .getByRole("button", { name: "Включить наклон телефона" })
      .click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-permission-calls",
      "1",
    );
    await page.evaluate(() =>
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", { beta: 60, gamma: 0 }),
      ),
    );
    await expect(page.locator(".tilt-controls")).toContainText(
      "движется вместе",
    );
    await page.evaluate(() =>
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", {
          beta: 70,
          gamma: 20,
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
        new DeviceOrientationEvent("deviceorientation", {
          beta: 60,
          gamma: -20,
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
    await page.locator("#about").scrollIntoViewIfNeeded();
    await expect(page.locator(".hero-product-float")).toHaveCSS(
      "animation-play-state",
      "paused",
    );
  });

  test("denied sensor permission keeps floating and touch interaction available", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() =>
      Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
        configurable: true,
        value: () => Promise.resolve("denied"),
      }),
    );
    await page.addInitScript(() =>
      Object.defineProperty(DeviceMotionEvent, "requestPermission", {
        configurable: true,
        value: undefined,
      }),
    );
    await page.goto("./");
    await page
      .getByRole("button", { name: "Включить наклон телефона" })
      .click();
    await expect(page.locator(".tilt-controls")).toContainText(
      "реагирует на касание",
    );
    await expect(page.locator(".hero-product-float")).toHaveCSS(
      "animation-name",
      "float",
    );
    await page.locator(".hero").dispatchEvent("pointermove", {
      pointerType: "touch",
      clientX: 340,
      clientY: 350,
    });
    await expect
      .poll(() =>
        page
          .locator(".hero-product-parallax")
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
      )
      .toBeGreaterThan(1);
  });

  test("sensors can work without a permission API and reduced motion stops all movement", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() =>
      Object.defineProperty(DeviceOrientationEvent, "requestPermission", {
        configurable: true,
        value: undefined,
      }),
    );
    await page.addInitScript(() =>
      Object.defineProperty(DeviceMotionEvent, "requestPermission", {
        configurable: true,
        value: undefined,
      }),
    );
    await page.goto("./");
    await expect(page.locator(".tilt-controls")).toContainText(
      "Наклони телефон",
    );
    await page.evaluate(() => {
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", { beta: 50, gamma: 0 }),
      );
      window.dispatchEvent(
        new DeviceOrientationEvent("deviceorientation", {
          beta: 50,
          gamma: 25,
        }),
      );
    });
    await expect
      .poll(() =>
        page
          .locator(".hero-product-parallax")
          .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
      )
      .toBeGreaterThan(2);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".tilt-controls")).toHaveCount(0);
    await expect(page.locator(".hero-product-float")).toHaveCSS(
      "animation-name",
      "none",
    );
    await expect(page.locator(".hero-product-parallax")).toHaveCSS(
      "transform",
      "none",
    );
  });

  test("all five hero flavors load separate high-detail responsive images", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    const buttons = page.locator(".flavor-dots button");
    for (let i = 0; i < 5; i++) {
      await buttons.nth(i).click();
      await expect(page.locator(".hero-product")).toHaveAttribute(
        "src",
        /hero-.*-small\.webp/,
      );
      await page.locator(".hero-product").evaluate(async (el) => {
        await (el as HTMLImageElement).decode();
      });
      expect(
        await page.locator(".hero-product").getAttribute("srcset"),
      ).toContain("480w");
      expect(
        await page
          .locator(".hero-product")
          .evaluate((el) => (el as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
    }
    await buttons.first().click();
    await page.locator(".hero-product").evaluate(async (el) => {
      await (el as HTMLImageElement).decode();
    });
    await page.screenshot({
      path: test.info().outputPath("hero-hd-mobile.png"),
    });
  });
});

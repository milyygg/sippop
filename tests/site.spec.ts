import { test, expect } from "@playwright/test";
test("catalog, mood, cart, checkout, localization and persistence", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(24);
  for (const [name, mood] of [
    ["Матча настроение", "ВЫДОХНУТЬ."],
    ["Черничный взрыв", "ТВОЙ МИГ."],
    ["Океанский лимонад", "ПРОХЛАДЫ."],
    ["Клубничная мечта", "ТВОЙ МИР."],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator("h1")).toContainText(mood);
  }
  await page
    .getByRole("button", { name: "Манговый всплеск", exact: true })
    .click();
  await expect(page.locator("h1")).toContainText("В СТАКАНЕ.");
  await page.getByRole("button", { name: "Матча 4", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(4);
  const card = page.locator(".product-card").first();
  await card.getByRole("button", { name: "500 мл" }).click();
  await card.getByRole("button", { name: /В корзину/ }).click();
  await page.locator(".bag-button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".cart-summary strong")).toHaveText("460 ₽");
  await page.getByRole("button", { name: /Увеличить количество/ }).click();
  await expect(page.locator(".cart-summary strong")).toHaveText("920 ₽");
  await page.getByRole("button", { name: "Перейти к оформлению" }).click();
  await page.getByLabel("Доставка", { exact: true }).check();
  await expect(page.locator(".checkout-note")).toContainText(
    "контактные данные не запрашиваются",
  );
  await page.getByRole("button", { name: "Завершить демозаказ" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Реальные заказы пока не принимаются",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".bag-button")).toBeFocused();
  await page.getByRole("button", { name: "Переключить на английский" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#menu h2")).toHaveText("Find your next favorite");
  await page.getByRole("button", { name: "Switch theme" }).click();
  const theme = await page.locator("html").getAttribute("data-theme");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
  await expect(page.locator(".bag-button b")).toHaveText("2");
  expect(errors).toEqual([]);
});
test("responsive layouts, images, mobile navigation and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await expect(page.locator(".mobile-nav")).toBeVisible();
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Меню", exact: true })
    .click();
  await expect(page.locator(".mobile-nav")).not.toBeVisible();
  await page.locator("#locations").scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((img) => {
        img.loading = "eager";
        return img.decode().catch(() => {});
      }),
    );
  });
  expect(
    await page.evaluate(() =>
      Array.from(document.images)
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.src),
    ),
  ).toEqual([]);
  await page.locator("#top").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: test.info().outputPath("mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: test.info().outputPath("desktop.png"),
    fullPage: true,
  });
});

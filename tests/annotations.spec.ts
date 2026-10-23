import { test, expect } from "@playwright/test";

test("single flavor names, aligned purchase rows and centered hero CTA", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator(".flavor-card-detail strong")).toHaveCount(0);
  await expect(page.locator(".flavor-card-heading")).toHaveCount(5);
  await expect(page.locator(".ticker")).toHaveCount(0);
  await expect(page.locator(".ribbon-art svg path")).toHaveCount(5);
  for (const lang of ["ru", "en"]) {
    if (lang === "en") await page.locator(".language-button").click();
    for (const width of [320, 390, 768, 1024, 1101, 1440]) {
      await page.setViewportSize({ width, height: 884 });
      await page.evaluate(() => document.fonts.ready);
      const rows = await page.locator(".product-card").evaluateAll((cards) => {
        const rows: Record<number, number[]> = {};
        for (const card of cards) {
          const row = Math.round(card.getBoundingClientRect().top);
          const bottom = card
            .querySelector(".product-bottom")!
            .getBoundingClientRect();
          (rows[row] ??= []).push(bottom.top);
        }
        return Object.values(rows).map(
          (values) => Math.max(...values) - Math.min(...values),
        );
      });
      expect(rows.every((offset) => offset < 2)).toBeTruthy();
      const cta = await page.locator(".hero-cta").evaluate((el) => {
        const box = el.getBoundingClientRect();
        const text = el
          .querySelector(".hero-cta-label")!
          .getBoundingClientRect();
        return {
          x: Math.abs((box.left + box.right - text.left - text.right) / 2),
          y: Math.abs((box.top + box.bottom - text.top - text.bottom) / 2),
        };
      });
      expect(cta.x).toBeLessThan(1);
      expect(cta.y).toBeLessThan(1);
      expect(
        await page
          .locator(".hero-ingredients li")
          .evaluateAll((items) =>
            items.every((item) => item.scrollWidth <= item.clientWidth + 1),
          ),
      ).toBeTruthy();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
  }
  await page.setViewportSize({ width: 1101, height: 884 });
  await page.locator(".language-button").click();
  await page.locator(".theme-toggle").click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: test.info().outputPath("hero-dark-1101.png") });
  await page
    .locator(".flavor-ribbon")
    .screenshot({ path: test.info().outputPath("flavor-ribbon.png") });
  await page
    .locator("#menu")
    .screenshot({ path: test.info().outputPath("menu-alignment.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: test.info().outputPath("hero-dark-mobile.png"),
  });
});

test("both languages are complete across the page, moods and checkout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  for (const lang of ["ru", "en"] as const) {
    if (lang === "en") await page.locator(".language-button").click();
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    const foreignText = async () =>
      page
        .locator("body")
        .evaluate((el) => el.innerText.replace(/SIP\s*POP!?/g, ""));
    expect(await foreignText()).not.toMatch(
      lang === "ru" ? /[a-z]/i : /[а-яё]/i,
    );
    const switches = page.locator(".flavor-dots button");
    for (let i = 0; i < 5; i++) {
      await switches.nth(i).click();
      await expect(page.locator("h1")).toBeVisible();
      expect(await foreignText()).not.toMatch(
        lang === "ru" ? /[a-z]/i : /[а-яё]/i,
      );
    }
    const labels = await page
      .locator("img[alt],button[aria-label],a[aria-label]")
      .evaluateAll((elements) =>
        elements
          .map((el) => el.getAttribute("alt") ?? el.getAttribute("aria-label"))
          .join(" ")
          .replaceAll("SIPPOP!", ""),
      );
    expect(labels).not.toMatch(lang === "ru" ? /[a-z]/i : /[а-яё]/i);
    await page.locator(".product-card").first().locator(".add-button").click();
    await page.locator(".bag-button").click();
    expect(await page.getByRole("dialog").innerText()).not.toMatch(
      lang === "ru" ? /[a-z]/i : /[а-яё]/i,
    );
    await page.locator(".cart-summary .button").click();
    expect(await page.getByRole("dialog").innerText()).not.toMatch(
      lang === "ru" ? /[a-z]/i : /[а-яё]/i,
    );
    await page.keyboard.press("Escape");
    expect(await page.title()).not.toMatch(
      lang === "ru" ? /Drink your mood/ : /[а-яё]/i,
    );
    await expect(page.locator(".site-footer button")).toHaveCount(0);
  }
});

test("all products have distinct loaded images and arch captions are centered below the drinks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1575, height: 884 });
  await page.goto("./");
  const sources = await page
    .locator(".product-image img")
    .evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).src));
  expect(sources).toHaveLength(24);
  expect(new Set(sources).size).toBe(24);
  for (const width of [320, 390, 768, 1024, 1575, 1920]) {
    await page.setViewportSize({ width, height: 884 });
    await page.locator("#flavors").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const cards = page.locator(".flavor-card");
    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      await card.scrollIntoViewIfNeeded();
      const positions = await card.evaluate((el) => {
        const card = el.getBoundingClientRect();
        const image = el.querySelector("img")!.getBoundingClientRect();
        const title = el
          .querySelector(".flavor-card-heading")!
          .getBoundingClientRect();
        const detail = el
          .querySelector(".flavor-card-detail")!
          .getBoundingClientRect();
        return {
          gap: title.top - image.bottom,
          center: Math.abs(
            (detail.left + detail.right) / 2 - (card.left + card.right) / 2,
          ),
          inside: title.left >= card.left && title.right <= card.right,
          textAlign: getComputedStyle(el.querySelector(".flavor-card-detail")!)
            .textAlign,
        };
      });
      expect(positions.gap).toBeGreaterThanOrEqual(10);
      expect(positions.center).toBeLessThan(2);
      expect(positions.inside).toBeTruthy();
      expect(positions.textAlign).toBe("center");
    }
    if (width >= 768) {
      const headings = await page
        .locator(".section-heading")
        .evaluateAll((elements) =>
          elements.map((el) => {
            const a = el.querySelector("h2")!.getBoundingClientRect();
            const b = el.querySelector("p")!.getBoundingClientRect();
            return Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2);
          }),
        );
      expect(headings.every((offset) => offset < 2)).toBeTruthy();
    }
  }
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map(async (img) => {
        img.loading = "eager";
        await img.decode();
      }),
    );
  });
  expect(
    await page
      .locator(".product-image img")
      .evaluateAll((imgs) =>
        imgs.every((img) => (img as HTMLImageElement).naturalWidth > 0),
      ),
  ).toBeTruthy();
  await page.setViewportSize({ width: 1575, height: 884 });
  await page
    .locator("#flavors")
    .screenshot({ path: test.info().outputPath("flavor-arches-ru.png") });
  await page
    .locator("#menu")
    .screenshot({ path: test.info().outputPath("catalog-ru.png") });
  await page.locator(".language-button").click();
  await page
    .locator("#flavors")
    .screenshot({ path: test.info().outputPath("flavor-arches-en.png") });
});

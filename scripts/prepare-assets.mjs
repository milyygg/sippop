import sharp from "sharp";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
const source = process.argv[2];
if (!source) throw new Error("Pass the generated sheet path");
await mkdir("public/assets", { recursive: true });
await mkdir("src/assets/originals", { recursive: true });
const dessert = process.argv.includes("--desserts");
await copyFile(
  source,
  `src/assets/originals/${dessert ? "desserts" : "drinks"}-sheet.png`,
);
const meta = await sharp(source).metadata();
console.log({ width: meta.width, height: meta.height, alpha: meta.hasAlpha });
const names = dessert
  ? ["berry-cheesecake", "mango-mochi", "matcha-cookie", "pink-donut"]
  : ["strawberry", "mango", "matcha", "blueberry", "ocean", "mocha"];
const columns = dessert ? 2 : 3;
const width = Math.floor(meta.width / columns),
  height = Math.floor(meta.height / 2);
for (const [i, name] of names.entries()) {
  const cell = {
    left: (i % columns) * width,
    top: Math.floor(i / columns) * height,
    width,
    height,
  };
  const buffer = await sharp(source).extract(cell).png().toBuffer();
  await sharp(buffer)
    .trim({ threshold: 10 })
    .resize({
      width: dessert ? 540 : 560,
      height: dessert ? 440 : 760,
      fit: "inside",
    })
    .webp({ quality: 85, alphaQuality: 95 })
    .toFile(`public/assets/${name}.webp`);
}
await writeFile(
  `src/assets/${dessert ? "desserts" : "drinks"}-generation.json`,
  JSON.stringify(
    {
      date: "2026-10-21",
      tool: "Built-in image_gen",
      source: "Original generated concept assets",
      names,
    },
    null,
    2,
  ),
);

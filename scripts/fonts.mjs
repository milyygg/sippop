import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/fonts", { recursive: true });
const css = await (
  await fetch(
    "https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&family=Unbounded:wght@700..900&display=swap",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    },
  )
).text();
let result = css;
const urls = [
  ...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1])),
];
for (const [i, url] of urls.entries()) {
  const name = `font-${i}.${url.includes(".woff2") ? "woff2" : "ttf"}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(url);
  await writeFile(`public/fonts/${name}`, Buffer.from(await res.arrayBuffer()));
  result = result.replaceAll(url, `/fonts/${name}`);
}
await writeFile("src/styles/fonts.css", result);
for (const family of ["golostext", "unbounded"]) {
  const r = await fetch(
    `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`,
  );
  if (!r.ok) throw new Error(family);
  await writeFile(`public/fonts/${family}-OFL.txt`, await r.text());
}
console.log("Local fonts saved", urls.length);

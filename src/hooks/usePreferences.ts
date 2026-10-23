import { useEffect, useState } from "react";
import { readStored, writeStored } from "../lib/storage";
import type { Lang } from "../data/products";
import { dictionary } from "../i18n";
export function usePreferences() {
  const [lang, setLang] = useState<Lang>(() =>
    readStored("sippop-lang") === "en" ? "en" : "ru",
  );
  const [theme, setTheme] = useState(
    () =>
      readStored("sippop-theme") ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  useEffect(() => {
    document.documentElement.lang = lang;
    const t = dictionary[lang];
    document.title = t.seoTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.seoDescription);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", t.seoTitle);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", t.seoDescription);
    writeStored("sippop-lang", lang);
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStored("sippop-theme", theme);
  }, [theme]);
  return { lang, setLang, theme, setTheme };
}

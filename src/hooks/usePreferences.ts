import { useEffect, useState } from "react";
import { readStored, writeStored } from "../lib/storage";
import type { Lang } from "../data/products";
import { dictionary } from "../i18n";
export function usePreferences() {
  const [lang, setLang] = useState<Lang>(() => {
    const requested = new URLSearchParams(location.search).get("lang");
    if (requested === "ru" || requested === "en") return requested;
    const saved = readStored("miloserdov-language") ?? readStored("sippop-lang");
    if (saved === "ru" || saved === "en") return saved;
    return (navigator.languages?.[0] || navigator.language || "en").toLowerCase().startsWith("ru") ? "ru" : "en";
  });
  const [theme, setTheme] = useState(
    () =>
      readStored("sippop-theme") ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  useEffect(() => {
    document.documentElement.lang = lang;
    const url = new URL(location.href);
    if (url.searchParams.has("lang")) {
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
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
    writeStored("miloserdov-language", lang);
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStored("sippop-theme", theme);
  }, [theme]);
  return { lang, setLang, theme, setTheme };
}

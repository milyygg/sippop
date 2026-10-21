import { useEffect, useState } from "react";
import { readStored, writeStored } from "../lib/storage";
import type { Lang } from "../data/products";
export function usePreferences() {
  const [lang, setLang] = useState<Lang>(() =>
    readStored("sippop-lang") === "en" ? "en" : "ru",
  );
  const [theme, setTheme] = useState(
    () =>
      readStored("sippop-theme") ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  const [moving, setMoving] = useState(
    () => readStored("sippop-motion") !== "off",
  );
  useEffect(() => {
    document.documentElement.lang = lang;
    writeStored("sippop-lang", lang);
  }, [lang]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStored("sippop-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.motion = moving ? "on" : "off";
    writeStored("sippop-motion", moving ? "on" : "off");
  }, [moving]);
  return { lang, setLang, theme, setTheme, moving, setMoving };
}

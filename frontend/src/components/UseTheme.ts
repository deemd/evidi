import { useEffect, useState } from "react";
import type { ThemeColor } from "./ThemeSwitcher";

const THEME_KEY = "evidi_theme";
const THEME_CLASSES = ["theme-default", "theme-black", "theme-blue", "theme-green"];

export function useTheme(initial: ThemeColor = "default") {
  const [theme, setTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeColor | null;
    return saved ?? initial;
  });

  useEffect(() => {
    const root = document.documentElement;

    // remove previous theme classes
    THEME_CLASSES.forEach(c => root.classList.remove(c));
    // add current theme class
    root.classList.add(`theme-${theme}`);

    // (optional) force dark class for the black theme to leverage dark styles
    // if (theme === "black") {
    //   root.classList.add("dark");
    // } else {
    //   root.classList.remove("dark");
    // }

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}

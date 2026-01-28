"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

function getThemeFromStorage(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme) || "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(newTheme: Theme) {
  const actualTheme = newTheme === "system" ? getSystemTheme() : newTheme;
  
  if (actualTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export default function ThemeSwitcher() {
  const theme = useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", callback);
      window.addEventListener("storage", callback);
      return () => {
        mediaQuery.removeEventListener("change", callback);
        window.removeEventListener("storage", callback);
      };
    },
    getThemeFromStorage,
    () => "system"
  );

  const handleThemeChange = (newTheme: Theme) => {
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    window.dispatchEvent(new Event("storage"));
  };

  useEffect(() => {
    applyTheme(theme as Theme);
  }, [theme]);

  return (
    <div className="w-fit inline-flex items-center gap-1 p-1 rounded-full bg-slate-800/20 backdrop-blur-sm border border-slate-700/90">
      <button
        onClick={() => handleThemeChange("light")}
        className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
          theme === "light" ? "bg-slate-700 text-yellow-300" : "text-black dark:text-white hover:text-slate-500"
        }`}
        aria-label="Light theme"
      >
        <Sun size={18} />
      </button>

      <button
        onClick={() => handleThemeChange("dark")}
        className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
          theme === "dark" ? "bg-slate-700 text-blue-300" : "text-black dark:text-white hover:text-slate-500"
        }`}
        aria-label="Dark theme"
      >
        <Moon size={18} />
      </button>

      <button
        onClick={() => handleThemeChange("system")}
        className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
          theme === "system" ? "bg-slate-700 text-purple-300" : "text-black dark:text-white hover:text-slate-500"
        }`}
        aria-label="System theme"
      >
        <Monitor size={18} />
      </button>
    </div>
  );
}
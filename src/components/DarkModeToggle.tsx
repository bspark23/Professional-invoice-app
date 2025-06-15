
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "invoicer-pro-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(STORAGE_KEY) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
};

const DarkModeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      aria-label="Toggle dark mode"
      className="flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ml-2 hover:scale-105 transition"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      <span className="ml-1 text-xs">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
};

export default DarkModeToggle;

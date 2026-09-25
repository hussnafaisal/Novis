"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("novis-theme");

    // Dark is the default theme
    const next: "dark" | "light" =
      saved === "light" ? "light" : "dark";

    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function toggle() {
    const next: "dark" | "light" =
      theme === "dark" ? "light" : "dark";

    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("novis-theme", next);
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
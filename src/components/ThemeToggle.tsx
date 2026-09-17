"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 w-10 rounded-full" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white/45 text-ink-900 backdrop-blur-md transition hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black/50 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:focus-visible:outline-white/80"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

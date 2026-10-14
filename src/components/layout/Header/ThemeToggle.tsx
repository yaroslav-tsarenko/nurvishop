"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/providers/ThemeProvider";
import { iconButtonClass } from "./iconButtonClass";

export function ThemeToggle() {
  const t = useTranslations("nav");
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={iconButtonClass}
      onClick={toggleTheme}
      aria-label={theme === "light" ? t("switchToDark") : t("switchToLight")}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}

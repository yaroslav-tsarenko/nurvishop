import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "lv"],
  defaultLocale: "en",
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<AppLocale, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  lv: { short: "LV", name: "Latviešu" },
};

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return !!value && (routing.locales as readonly string[]).includes(value);
}

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

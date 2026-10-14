import type { Metadata } from "next";
import { routing, type AppLocale } from "@/i18n/routing";

export const SITE_NAME = "nurvishop";
export const DEFAULT_OG_IMAGE = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

const OG_LOCALES: Record<AppLocale, string> = { en: "en_GB", lv: "lv_LV" };

/** canonical + hreflang links for a path given without the locale prefix ("/catalog/x"). */
export function localeAlternates(locale: string, path = ""): Metadata["alternates"] {
  const clean = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `/${l}${clean}`;
  languages["x-default"] = `/${routing.defaultLocale}${clean}`;
  return { canonical: `/${locale}${clean}`, languages };
}

type OgImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * Child segments replace the parent's `openGraph` object wholesale, so every
 * page that customises it must repeat the shared fields — this keeps them in
 * one place.
 */
export function openGraphFor(
  locale: string,
  opts: { title?: string; description?: string; path?: string; images?: OgImage[]; type?: "website" | "article" } = {},
): NonNullable<Metadata["openGraph"]> {
  const images = opts.images?.length ? opts.images : [DEFAULT_OG_IMAGE];
  return {
    type: opts.type ?? "website",
    siteName: SITE_NAME,
    locale: OG_LOCALES[locale as AppLocale] ?? OG_LOCALES.en,
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
    ...(opts.title ? { title: opts.title } : {}),
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.path !== undefined ? { url: `/${locale}${opts.path}` } : {}),
    images,
  };
}

export function twitterFor(opts: { title?: string; description?: string; images?: OgImage[] }): NonNullable<Metadata["twitter"]> {
  const images = opts.images?.length ? opts.images : [DEFAULT_OG_IMAGE];
  return {
    card: "summary_large_image",
    ...(opts.title ? { title: opts.title } : {}),
    ...(opts.description ? { description: opts.description } : {}),
    images: images.map((i) => i.url),
  };
}

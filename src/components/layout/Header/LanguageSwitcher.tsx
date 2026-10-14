"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "lucide-react";
import clsx from "clsx";
import { LOCALE_LABELS, routing, usePathname, useRouter, type AppLocale } from "@/i18n/routing";

function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: AppLocale) => {
    // Keep the query string (search terms, filters) when changing language.
    const search = typeof window !== "undefined" ? window.location.search : "";
    startTransition(() => {
      router.replace(`${pathname}${search}`, { locale: next, scroll: false });
    });
  };

  return { switchTo, isPending };
}

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const { switchTo, isPending } = useSwitchLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[0.8125rem] font-bold text-ink transition-[background-color,border-color,opacity] duration-150 hover:border-accent hover:bg-lilac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          isPending && "opacity-60",
        )}
      >
        <Globe size={14} className="text-muted" />
        <span>{LOCALE_LABELS[locale].short}</span>
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 top-full z-[60] mt-1.5 min-w-[150px] overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg"
        >
          {routing.locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code}>
                <button
                  role="option"
                  aria-selected={active}
                  lang={code}
                  onClick={() => {
                    setOpen(false);
                    if (!active) switchTo(code);
                  }}
                  className={clsx(
                    "flex w-full cursor-pointer items-center gap-2 border-none px-3 py-2 text-left text-[0.8125rem] transition-colors duration-150",
                    active ? "bg-accent-light font-bold text-accent" : "bg-transparent font-medium text-ink hover:bg-mist",
                  )}
                >
                  <span className="w-6 text-[0.6875rem] font-bold tracking-wide text-muted">{LOCALE_LABELS[code].short}</span>
                  {LOCALE_LABELS[code].name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Segmented EN | LV control for the mobile drawer. */
export function LanguageSegmented({ onSwitch }: { onSwitch?: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const { switchTo } = useSwitchLocale();

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-[0.875rem] font-medium text-muted">
        <Globe size={16} /> {t("language")}
      </span>
      <div role="radiogroup" aria-label={t("language")} className="flex rounded-pill border border-line bg-mist p-0.5">
        {routing.locales.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              role="radio"
              aria-checked={active}
              lang={code}
              title={LOCALE_LABELS[code].name}
              onClick={() => {
                if (active) return;
                onSwitch?.();
                switchTo(code);
              }}
              className={clsx(
                "cursor-pointer rounded-pill border-none px-3.5 py-1 text-[0.8125rem] font-bold transition-colors duration-150",
                active ? "bg-accent text-white" : "bg-transparent text-muted hover:text-ink",
              )}
            >
              {LOCALE_LABELS[code].short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

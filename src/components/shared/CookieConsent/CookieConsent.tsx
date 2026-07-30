"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/routing";

const STORAGE_KEY = "cookie-consent";
const OPEN_EVENT = "open-cookie-settings";

type Category = "necessary" | "functional" | "analytics" | "marketing";

interface ConsentValue {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

const OPTIONAL: { key: Exclude<Category, "necessary">; label: string; description: string }[] = [
  {
    key: "functional",
    label: "Functional",
    description: "Remember preferences such as recently viewed products and display settings.",
  },
  {
    key: "analytics",
    label: "Analytics & performance",
    description: "Help us understand how visitors use the site so we can improve it.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Used to deliver and measure more relevant advertising.",
  },
];

/** Reopen the cookie preferences panel from anywhere (e.g. footer link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ functional: false, analytics: false, marketing: false });

  useEffect(() => {
    let stored: ConsentValue | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as ConsentValue;
    } catch {
      stored = null;
    }
    if (!stored) {
      setVisible(true);
    } else {
      setPrefs({
        functional: !!stored.functional,
        analytics: !!stored.analytics,
        marketing: !!stored.marketing,
      });
    }

    const reopen = () => {
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const persist = (value: { functional: boolean; analytics: boolean; marketing: boolean }) => {
    const consent: ConsentValue = {
      necessary: true,
      ...value,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // ignore write failures (private mode etc.)
    }
    setPrefs(value);
    setVisible(false);
    setShowDetails(false);
  };

  const acceptAll = () => persist({ functional: true, analytics: true, marketing: true });
  const rejectAll = () => persist({ functional: false, analytics: false, marketing: false });
  const savePrefs = () => persist(prefs);

  if (!visible) return null;

  const secondaryBtn =
    "min-w-[120px] flex-1 cursor-pointer rounded-sm border border-line bg-surface px-3.5 py-2.5 text-[0.8125rem] font-semibold text-ink transition-colors duration-150 hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/25 p-4 backdrop-blur-[2px] md:justify-start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
    >
      <div className="relative w-full max-w-[460px] rounded-lg border border-line bg-surface p-6 shadow-lg">
        <button
          type="button"
          className="absolute right-3 top-3 flex cursor-pointer p-1 text-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={() => setVisible(false)}
          aria-label="Close cookie banner"
        >
          <X size={16} />
        </button>

        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-accent-light text-accent">
            <Cookie size={20} />
          </span>
          <h2 id="cookie-title" className="text-[1.0625rem] font-bold text-ink">
            We value your privacy
          </h2>
        </div>

        <p className="mb-4 text-[0.8125rem] leading-relaxed text-muted">
          We use strictly necessary cookies to make our store work. With your consent we also use
          functional, analytics, and marketing cookies. You can accept all, reject non-essential
          cookies, or set your own preferences. Read more in our{" "}
          <Link href="/policies/cookies" className="font-semibold text-accent">
            Cookie Policy
          </Link>
          .
        </p>

        {showDetails && (
          <div className="mb-4 flex max-h-[240px] flex-col gap-3 overflow-y-auto pr-1">
            <div className="rounded-sm border border-line px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.8125rem] font-semibold text-ink">Strictly necessary</span>
                <span className="text-[0.6875rem] font-semibold text-accent">Always active</span>
              </div>
              <p className="mt-1.5 text-xs leading-normal text-subtle">
                Required for cart, checkout, login, payment security and fraud prevention.
              </p>
            </div>
            {OPTIONAL.map((c) => (
              <div key={c.key} className="rounded-sm border border-line px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.8125rem] font-semibold text-ink">{c.label}</span>
                  <label className="relative inline-block h-5 w-9 flex-shrink-0">
                    <input
                      type="checkbox"
                      className="peer h-0 w-0 opacity-0"
                      checked={prefs[c.key]}
                      onChange={(e) => setPrefs((p) => ({ ...p, [c.key]: e.target.checked }))}
                    />
                    <span className="absolute inset-0 cursor-pointer rounded-pill bg-line transition-colors duration-200 before:absolute before:bottom-[3px] before:left-[3px] before:h-3.5 before:w-3.5 before:rounded-full before:bg-white before:transition-transform before:duration-200 peer-checked:bg-accent peer-checked:before:translate-x-4" />
                  </label>
                </div>
                <p className="mt-1.5 text-xs leading-normal text-subtle">{c.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {showDetails ? (
            <button type="button" className={secondaryBtn} onClick={savePrefs}>
              Save preferences
            </button>
          ) : (
            <button type="button" className={secondaryBtn} onClick={() => setShowDetails(true)}>
              Customize
            </button>
          )}
          <button type="button" className={secondaryBtn} onClick={rejectAll}>
            Reject non-essential
          </button>
          <button
            type="button"
            className="min-w-[120px] flex-1 cursor-pointer rounded-sm border-none bg-accent px-3.5 py-2.5 text-[0.8125rem] font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={acceptAll}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import styles from "./CookieConsent.module.css";

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

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="cookie-title">
      <div className={styles.banner}>
        <button
          type="button"
          className={styles.close}
          onClick={() => setVisible(false)}
          aria-label="Close cookie banner"
        >
          <X size={16} />
        </button>

        <div className={styles.header}>
          <span className={styles.icon}>
            <Cookie size={20} />
          </span>
          <h2 id="cookie-title" className={styles.title}>
            We value your privacy
          </h2>
        </div>

        <p className={styles.text}>
          We use strictly necessary cookies to make our store work. With your consent we also use
          functional, analytics, and marketing cookies. You can accept all, reject non-essential
          cookies, or set your own preferences. Read more in our{" "}
          <Link href="/policies/cookies" className={styles.inlineLink}>
            Cookie Policy
          </Link>
          .
        </p>

        {showDetails && (
          <div className={styles.details}>
            <div className={styles.category}>
              <div className={styles.categoryHead}>
                <span className={styles.categoryLabel}>Strictly necessary</span>
                <span className={styles.always}>Always active</span>
              </div>
              <p className={styles.categoryDesc}>
                Required for cart, checkout, login, payment security and fraud prevention.
              </p>
            </div>
            {OPTIONAL.map((c) => (
              <div key={c.key} className={styles.category}>
                <div className={styles.categoryHead}>
                  <span className={styles.categoryLabel}>{c.label}</span>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={prefs[c.key]}
                      onChange={(e) => setPrefs((p) => ({ ...p, [c.key]: e.target.checked }))}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
                <p className={styles.categoryDesc}>{c.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          {showDetails ? (
            <button type="button" className={styles.secondary} onClick={savePrefs}>
              Save preferences
            </button>
          ) : (
            <button
              type="button"
              className={styles.secondary}
              onClick={() => setShowDetails(true)}
            >
              Customize
            </button>
          )}
          <button type="button" className={styles.secondary} onClick={rejectAll}>
            Reject non-essential
          </button>
          <button type="button" className={styles.primary} onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

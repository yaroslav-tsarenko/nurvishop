"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency, type Currency } from "@/providers/CurrencyProvider";

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Currency"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[0.8125rem] font-bold text-ink transition-[background-color,border-color] duration-150 hover:border-accent hover:bg-lilac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span className="text-[0.9375rem] leading-none">{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.375rem",
            background: "var(--color-bg, #fff)",
            border: "1px solid var(--color-border, #e5e5e5)",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            zIndex: 60,
            minWidth: "120px",
            overflow: "hidden",
          }}
        >
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 0.75rem",
                fontSize: "0.8125rem",
                fontWeight: c.code === currency ? 700 : 500,
                textAlign: "left",
                background: c.code === currency ? "var(--color-accent-light)" : "transparent",
                color: c.code === currency ? "var(--color-accent)" : "var(--color-text)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

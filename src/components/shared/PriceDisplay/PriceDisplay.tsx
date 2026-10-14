"use client";

import { useCurrency } from "@/providers/CurrencyProvider";

interface PriceDisplayProps {
  price: number;
  comparePrice?: number | null;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { price: "0.9375rem", compare: "0.75rem" },
  md: { price: "1.25rem", compare: "0.875rem" },
  lg: { price: "1.75rem", compare: "1.0625rem" },
};

export function PriceDisplay({
  price,
  comparePrice,
  size = "md",
}: PriceDisplayProps) {
  const { format } = useCurrency();
  const isOnSale = comparePrice && comparePrice > price;

  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: sizes[size].price,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: isOnSale ? "var(--color-accent)" : "var(--color-text)",
        }}
      >
        {format(price)}
      </span>
      {isOnSale && (
        <span
          style={{
            fontSize: sizes[size].compare,
            color: "var(--color-text-tertiary)",
            textDecoration: "line-through",
          }}
        >
          {format(comparePrice)}
        </span>
      )}
    </div>
  );
}

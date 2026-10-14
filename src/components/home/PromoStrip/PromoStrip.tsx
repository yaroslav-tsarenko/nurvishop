"use client";

import {
  Truck, RotateCcw, Shield, Gift, Award, Headphones,
  Zap, Heart, Star, Package, Clock, CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, RotateCcw, Shield, Gift, Award, Headphones,
  Zap, Heart, Star, Package, Clock, CheckCircle,
};

interface PromoItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
}

interface Props {
  items: PromoItem[];
}

// Fallback items when none are configured in the admin; `key` maps to
// home.promoStrip.<key>.{title,subtitle}.
const defaultItems: { id: string; icon: string; key: string }[] = [
  { id: "1", icon: "Heart", key: "made" },
  { id: "2", icon: "RotateCcw", key: "returns" },
  { id: "3", icon: "Shield", key: "warranty" },
  { id: "4", icon: "Gift", key: "giftCards" },
  { id: "5", icon: "Award", key: "quality" },
  { id: "6", icon: "Headphones", key: "support" },
];

export function PromoStrip({ items }: Props) {
  const t = useTranslations("home.promoStrip");
  const data: PromoItem[] =
    items.length > 0
      ? items
      : defaultItems.map((d) => ({
          id: d.id,
          icon: d.icon,
          title: t(`${d.key}.title`),
          subtitle: t(`${d.key}.subtitle`),
        }));

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1400px] items-center justify-start gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-between">
        {data.map((b) => {
          const Icon = ICON_MAP[b.icon] || Package;
          return (
            <div
              key={b.id}
              className="flex flex-shrink-0 cursor-default items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 transition-colors duration-200 hover:bg-mist"
            >
              <Icon size={18} className="flex-shrink-0 text-accent" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-ink">{b.title}</span>
                {b.subtitle && (
                  <span className="text-[0.65rem] text-subtle">{b.subtitle}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

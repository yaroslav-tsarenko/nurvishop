"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import clsx from "clsx";
import {
  Flame, Apple, Wind, Gift, Smartphone, Gamepad2,
  Lightbulb, Sparkles, Tag, Package, Star, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Flame, Apple, Wind, Gift, Smartphone, Gamepad2,
  Lightbulb, Sparkles, Tag, Package, Star, Zap,
};

interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  linkUrl: string;
  color: string;
}

interface Props {
  tabs: TabData[];
}

export function HorizontalTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);

  if (!tabs.length) return null;

  return (
    <div className="mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab, i) => {
          const Icon = tab.icon ? ICON_MAP[tab.icon] : Tag;
          return (
            <Link
              key={tab.id}
              href={tab.linkUrl}
              className={clsx(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-[0.4rem] text-[0.8125rem] font-medium text-ink no-underline transition-[border-color,box-shadow] duration-200 hover:border-line-hover hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                i === active
                  ? "border-accent bg-accent-light"
                  : "border-line bg-surface",
              )}
              onClick={() => setActive(i)}
            >
              <Icon size={15} style={{ color: tab.color }} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

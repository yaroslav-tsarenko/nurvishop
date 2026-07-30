"use client";

import { Link } from "@/i18n/routing";

interface BannerData {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
}

interface Props {
  smallBanners: BannerData[];
  wideBanners: BannerData[];
}

const defaultSmall: BannerData[] = [
  { id: "1", badgeText: "Circuit Breakers", title: "Protect Every Circuit", subtitle: "From €12.99", bgColor: "var(--promo-bg-blue, #F0F4FF)", textColor: "var(--color-text, #1A1A2E)", linkUrl: "/catalog/smart-modular-circuit-breakers" },
  { id: "2", badgeText: "Cables & Wiring", title: "Premium Copper Cables", subtitle: "Up to 30% off", bgColor: "var(--promo-bg-warm, #FFF8F0)", textColor: "var(--color-text, #1A1A2E)", linkUrl: "/catalog/installation-and-wiring-materials" },
  { id: "3", badgeText: "LED Lighting", title: "Illuminate Your Space", subtitle: "From €4.99", bgColor: "var(--promo-bg-green, #F0FFF4)", textColor: "var(--color-text, #1A1A2E)", linkUrl: "/catalog/lighting" },
];

const defaultWide: BannerData[] = [
  { id: "w1", badgeText: "Pro Account", title: "Register & Get 10% Off Your First Order", subtitle: "Free shipping over €100, trade pricing, and priority support", bgColor: "#1A1A2E", textColor: "#ffffff", linkUrl: "/auth/register", ctaLabel: "Join Free" },
];

export function PromoBannerGrid({ smallBanners, wideBanners }: Props) {
  const small = smallBanners.length > 0 ? smallBanners : defaultSmall;
  const wide = wideBanners.length > 0 ? wideBanners : defaultWide;

  return (
    <div className="mb-6 flex flex-col gap-3">
      {small.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {small.map((b) => (
            <Link
              key={b.id}
              href={b.linkUrl || "#"}
              className="flex flex-col rounded-md border border-line p-5 text-ink no-underline transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              style={{ background: b.bgColor, color: b.textColor }}
            >
              {b.badgeText && (
                <span className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.05em]">
                  {b.badgeText}
                </span>
              )}
              <h3 className="mb-1 text-base font-bold leading-tight">{b.title}</h3>
              {b.subtitle && (
                <span className="mb-3 text-[0.8125rem] text-muted">{b.subtitle}</span>
              )}
              <span className="mt-auto text-[0.8125rem] font-semibold">Shop now &rarr;</span>
            </Link>
          ))}
        </div>
      )}
      {wide.map((b) => (
        <Link
          key={b.id}
          href={b.linkUrl || "#"}
          className="flex flex-col items-center gap-4 rounded-md p-5 text-center no-underline transition-opacity duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:flex-row md:justify-between md:gap-0 md:px-8 md:py-6 md:text-left"
          style={{ background: b.bgColor, color: b.textColor }}
        >
          <div className="flex-1">
            {b.badgeText && (
              <span className="mb-2 inline-block rounded-[4px] px-2 py-[0.2rem] text-[0.65rem] font-bold uppercase tracking-[0.05em] text-white">
                {b.badgeText}
              </span>
            )}
            <h3 className="mb-1.5 text-xl font-extrabold text-inherit">{b.title}</h3>
            {b.subtitle && <p className="m-0 text-[0.8125rem] opacity-70">{b.subtitle}</p>}
          </div>
          {b.ctaLabel && (
            <span className="flex-shrink-0 rounded-md px-6 py-2.5 text-sm font-semibold text-white md:ml-8">
              {b.ctaLabel}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

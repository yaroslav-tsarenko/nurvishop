"use client";

import { useTranslations } from "next-intl";
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

// Fallback banners when none are configured in the admin; copy lives in
// messages under home.promoGrid.<key>.
const defaultSmall = [
  { id: "1", key: "tableware", bgColor: "var(--promo-bg-blue)", textColor: "var(--color-text)", linkUrl: "/catalog?category=cutlery-crockery-and-glassware-5032" },
  { id: "2", key: "linen", bgColor: "var(--promo-bg-warm)", textColor: "var(--color-text)", linkUrl: "/catalog?category=soft-furnishings-18660" },
  { id: "3", key: "lighting", bgColor: "var(--promo-bg-green)", textColor: "var(--color-text)", linkUrl: "/catalog?category=home-d-cor-5684" },
] as const;

const defaultWide = [
  { id: "w1", key: "members", bgColor: "#2b241d", textColor: "#f0e9df", linkUrl: "/auth/register" },
] as const;

export function PromoBannerGrid({ smallBanners, wideBanners }: Props) {
  const t = useTranslations("home.promoGrid");
  const small: BannerData[] =
    smallBanners.length > 0
      ? smallBanners
      : defaultSmall.map(({ key, ...b }) => ({
          ...b,
          badgeText: t(`${key}.badge`),
          title: t(`${key}.title`),
          subtitle: t(`${key}.subtitle`),
        }));
  const wide: BannerData[] =
    wideBanners.length > 0
      ? wideBanners
      : defaultWide.map(({ key, ...b }) => ({
          ...b,
          badgeText: t(`${key}.badge`),
          title: t(`${key}.title`),
          subtitle: t(`${key}.subtitle`),
          ctaLabel: t(`${key}.cta`),
        }));

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
              <span className="mt-auto text-[0.8125rem] font-semibold">{t("shopNow")} &rarr;</span>
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
              <span className="mb-2 inline-block rounded-pill bg-accent px-2.5 py-[0.2rem] text-[0.65rem] font-bold uppercase tracking-[0.05em] text-white">
                {b.badgeText}
              </span>
            )}
            <h3 className="mb-1.5 text-xl font-extrabold text-inherit">{b.title}</h3>
            {b.subtitle && <p className="m-0 text-[0.8125rem] opacity-70">{b.subtitle}</p>}
          </div>
          {b.ctaLabel && (
            <span className="flex-shrink-0 rounded-pill bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 md:ml-8">
              {b.ctaLabel}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

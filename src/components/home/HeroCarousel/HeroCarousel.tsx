"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import clsx from "clsx";

interface SlideData {
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

interface DealData {
  id: string;
  title: string;
  oldPrice?: string | null;
  newPrice?: string | null;
  discountText?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
}

interface DefaultSlide {
  id: string;
  eyebrow: string;
  title: string;
  accent: string;
  subtitle: string;
  ctaLabel: string;
  linkUrl: string;
  secondaryLabel: string;
  secondaryHref: string;
  gradient: string;
}

const defaultSlides: DefaultSlide[] = [
  {
    id: "1",
    eyebrow: "New season · Warm Natural Home",
    title: "Home, made",
    accent: "softer.",
    subtitle:
      "Thoughtful pieces in linen, clay and oak — calm, tactile things that make everyday living feel a little kinder.",
    ctaLabel: "Shop the collection",
    linkUrl: "/catalog",
    secondaryLabel: "New arrivals",
    secondaryHref: "/catalog?sort=newest",
    gradient:
      "linear-gradient(135deg, #2b241d 0%, #463527 55%, #55412f 100%)",
  },
  {
    id: "2",
    eyebrow: "Textiles & Comfort",
    title: "Textures that",
    accent: "comfort.",
    subtitle:
      "Soft-washed linen, brushed cotton and hand-finished throws to layer warmth into every room.",
    ctaLabel: "Explore textiles",
    linkUrl: "/search?q=linen",
    secondaryLabel: "Shop throws",
    secondaryHref: "/search?q=throw",
    gradient:
      "linear-gradient(135deg, #33261e 0%, #4f3526 55%, #5c4030 100%)",
  },
  {
    id: "3",
    eyebrow: "Light & Atmosphere",
    title: "Warm light,",
    accent: "quiet evenings.",
    subtitle:
      "Ceramics, candles and gentle lighting to slow the pace and make the evenings glow.",
    ctaLabel: "Discover décor",
    linkUrl: "/search?q=ceramic",
    secondaryLabel: "Shop candles",
    secondaryHref: "/search?q=candle",
    gradient:
      "linear-gradient(135deg, #23281f 0%, #384333 55%, #2b241d 100%)",
  },
];

interface Props {
  slides: SlideData[];
  deals: DealData[];
}

export function HeroCarousel({ slides, deals }: Props) {
  const useDefaults = slides.length === 0;
  const [current, setCurrent] = useState(0);
  const count = useDefaults ? defaultSlides.length : slides.length;

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, count]);

  return (
    <div className="mb-4 flex gap-3">
      <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-2xl border border-sand-border shadow-card max-[640px]:min-h-[300px]">
        {useDefaults ? (
          <>
            {defaultSlides.map((slide, i) => (
              <div
                key={slide.id}
                className={clsx(
                  "absolute inset-0 flex items-center transition-opacity duration-[500ms] ease-out",
                  i === current ? "z-[1] opacity-100" : "z-0 opacity-0",
                )}
                style={{ background: slide.gradient }}
                aria-hidden={i !== current}
              >
                {/* soft decorative blobs */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-blob bg-accent/40 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-20 right-24 h-64 w-64 rounded-blob bg-ochre/25 blur-2xl" />
                <div className="pointer-events-none absolute left-[30%] top-6 h-40 w-40 rounded-blob bg-sage/30 blur-2xl" />
                <div className="pointer-events-none absolute -left-10 bottom-8 h-48 w-48 rounded-blob bg-accent/25 blur-2xl" />

                <div className="relative z-[2] max-w-[560px] p-12 max-[640px]:p-7">
                  <p className="eyebrow mb-4 !text-[#e9be6a]">{slide.eyebrow}</p>
                  <h2 className="m-0 mb-4 font-display text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[#f5efe6] max-[640px]:text-[2rem]">
                    {slide.title}{" "}
                    <span className="italic text-[#eab98d]">{slide.accent}</span>
                  </h2>
                  <p className="m-0 mb-7 max-w-[440px] text-[1rem] leading-[1.6] text-[#ded2c2]">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.linkUrl}
                      className="inline-block rounded-pill bg-accent px-7 py-3 text-sm font-semibold text-white no-underline shadow-accent transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      {slide.ctaLabel}
                    </Link>
                    <Link
                      href={slide.secondaryHref}
                      className="inline-block rounded-pill border border-white/70 bg-white/10 px-7 py-3 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      {slide.secondaryLabel}
                    </Link>
                  </div>
                  <p className="mt-6 text-[0.78rem] font-medium tracking-[0.02em] text-[#cbbfad]">
                    Thoughtfully made · Natural materials · Warm support
                  </p>
                </div>
              </div>
            ))}
          </>
        ) : (
          slides.map((slide, i) => (
            <div
              key={slide.id}
              className={clsx(
                "absolute inset-0 flex items-center transition-opacity duration-[500ms] ease-out",
                i === current ? "z-[1] opacity-100" : "z-0 opacity-0",
              )}
              style={{ background: slide.bgColor, color: slide.textColor }}
              aria-hidden={i !== current}
            >
              <div className="relative z-[2] max-w-[560px] p-12 max-[640px]:p-7">
                {slide.badgeText && (
                  <span className="mb-4 inline-block rounded-pill bg-accent-light px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-accent">
                    {slide.badgeText}
                  </span>
                )}
                <h2 className="m-0 mb-3 font-display text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.02em] max-[640px]:text-[1.9rem]">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="m-0 mb-6 text-[1rem] leading-[1.6] opacity-85">
                    {slide.subtitle}
                  </p>
                )}
                {slide.linkUrl && (
                  <Link
                    href={slide.linkUrl}
                    className="inline-block rounded-pill bg-accent px-7 py-3 text-sm font-semibold text-white no-underline transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    {slide.ctaLabel || "Shop Now"}
                  </Link>
                )}
              </div>
            </div>
          ))
        )}

        {count > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 z-[3] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/80 text-ink backdrop-blur transition-colors duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={prev}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="absolute right-3 top-1/2 z-[3] flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/80 text-ink backdrop-blur transition-colors duration-200 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={next}
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5">
              {Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  className={clsx(
                    "h-2 cursor-pointer border-none transition-[background,width] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    i === current
                      ? "w-6 rounded-pill bg-accent"
                      : "w-2 rounded-full bg-accent/30",
                  )}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {deals.length > 0 && (
        <div className="flex w-[220px] flex-shrink-0 flex-col gap-3 max-lg:hidden">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              href={deal.linkUrl || "/catalog"}
              className="relative flex flex-1 flex-col rounded-xl border border-line bg-surface p-4 text-ink no-underline transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {deal.discountText && (
                <span className="absolute right-2 top-2 rounded-pill bg-pop px-2 py-0.5 text-[0.7rem] font-bold text-pop-ink">
                  {deal.discountText}
                </span>
              )}
              <div className="mb-3 flex justify-center">
                {deal.imageUrl ? (
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="h-20 w-20 rounded-lg object-contain"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-well" />
                )}
              </div>
              <h4 className="m-0 mb-2 text-[0.8125rem] font-semibold leading-[1.3]">
                {deal.title}
              </h4>
              <div className="mt-auto flex items-center gap-2">
                {deal.oldPrice && (
                  <span className="text-xs text-subtle line-through">
                    {deal.oldPrice}
                  </span>
                )}
                {deal.newPrice && (
                  <span className="text-[0.9375rem] font-bold text-accent">
                    {deal.newPrice}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

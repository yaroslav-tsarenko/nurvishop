"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import clsx from "clsx";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";

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
  badgeText: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  bgImage: StaticImageData;
}

const defaultSlides: DefaultSlide[] = [
  {
    id: "1",
    badgeText: "Professional Grade",
    title: "Switchgear & Distribution Boards",
    subtitle: "Certified panels, circuit breakers, and modular enclosures for residential and commercial installations",
    ctaLabel: "Shop Now",
    linkUrl: "/catalog",
    bgColor: "#1A1A2E",
    textColor: "#ffffff",
    bgImage: banner1,
  },
  {
    id: "2",
    badgeText: "Complete Range",
    title: "Industrial Control & Automation",
    subtitle: "From compact enclosures to full-size distribution cabinets — everything for your next project",
    ctaLabel: "Browse Equipment",
    linkUrl: "/catalog",
    bgColor: "#F5F5F5",
    textColor: "#ffffff",
    bgImage: banner2,
  },
  {
    id: "3",
    badgeText: "Top Quality",
    title: "Cables, Wiring & Connectors",
    subtitle: "Premium copper cables, flexible wiring, terminal blocks and accessories at wholesale prices",
    ctaLabel: "View Cables",
    linkUrl: "/catalog",
    bgColor: "#0D1B2A",
    textColor: "#ffffff",
    bgImage: banner3,
  },
];

const bgImageMap: Record<string, StaticImageData> = {
  "1": banner1,
  "2": banner2,
  "3": banner3,
};

interface Props {
  slides: SlideData[];
  deals: DealData[];
}

export function HeroCarousel({ slides, deals }: Props) {
  const useDefaults = slides.length === 0;
  const activeSlides = useDefaults ? defaultSlides : slides;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, activeSlides.length]);

  const slide = activeSlides[current];
  const bgImage = useDefaults
    ? (slide as DefaultSlide).bgImage
    : bgImageMap[slide.id] || null;

  return (
    <div className="mb-4 flex gap-3">
      <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-md max-[640px]:min-h-[240px]">
        <div
          className="absolute inset-0 flex items-center transition-opacity duration-[400ms] ease-out"
          style={bgImage ? { color: "#fff" } : { background: slide.bgColor, color: slide.textColor }}
        >
          {bgImage && (
            <>
              <Image
                src={bgImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 75vw"
                className="z-0 object-cover object-[center_right]"
                priority={current === 0}
              />
              <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.35)_50%,rgba(0,0,0,0.05)_100%)]" />
            </>
          )}
          <div className="relative z-[2] max-w-[500px] p-10 max-[640px]:p-6">
            {slide.badgeText && (
              <span className="mb-4 inline-block rounded-sm px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-white">{slide.badgeText}</span>
            )}
            <h2 className="m-0 mb-3 font-display text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.02em] max-[640px]:text-xl">{slide.title}</h2>
            {slide.subtitle && <p className="m-0 mb-6 text-[0.9375rem] leading-[1.5] opacity-85">{slide.subtitle}</p>}
            {slide.linkUrl && (
              <Link
                href={slide.linkUrl}
                className="inline-block rounded-md px-6 py-2.5 text-sm font-semibold text-white no-underline transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {slide.ctaLabel || "Shop Now"}
              </Link>
            )}
          </div>
        </div>

        {activeSlides.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={prev}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="absolute right-3 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={next}
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3.5 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  className={clsx(
                    "h-2 cursor-pointer border-none transition-[background] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                    i === current ? "w-5 rounded-sm bg-white" : "w-2 rounded-full bg-white/40",
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
              className="relative flex flex-1 flex-col rounded-lg border border-line bg-surface p-4 text-ink no-underline transition-[border-color,box-shadow] duration-200 hover:border-line-hover hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {deal.discountText && (
                <span className="absolute right-2 top-2 rounded-sm bg-[#E53935] px-1.5 py-0.5 text-[0.7rem] font-bold text-white">{deal.discountText}</span>
              )}
              <div className="mb-3 flex justify-center">
                {deal.imageUrl ? (
                  <img src={deal.imageUrl} alt={deal.title} className="h-20 w-20 rounded-lg object-contain" />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-well" />
                )}
              </div>
              <h4 className="m-0 mb-2 text-[0.8125rem] font-semibold leading-[1.3]">{deal.title}</h4>
              <div className="mt-auto flex items-center gap-2">
                {deal.oldPrice && <span className="text-xs text-subtle line-through">{deal.oldPrice}</span>}
                {deal.newPrice && <span className="text-[0.9375rem] font-bold text-[#E53935]">{deal.newPrice}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { type StaticImageData } from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import banner1 from "@/assets/banner1.png";
import banner2 from "@/assets/banner2.png";
import banner3 from "@/assets/banner3.png";

interface Slide {
  titleKey: string;
  subtitleKey: string;
  ctaHref: string;
  ctaKey: string;
  secondaryCtaHref?: string;
  secondaryCtaKey?: string;
  badge?: string;
  image: StaticImageData;
}

const slides: Slide[] = [
  {
    badge: "Professional Grade",
    titleKey: "heroTitle",
    subtitleKey: "heroSubtitle",
    ctaHref: "/catalog",
    ctaKey: "heroCta",
    secondaryCtaHref: "/catalog?sort=newest",
    secondaryCtaKey: "heroExplore",
    image: banner1,
  },
  {
    badge: "Limited Time Offer",
    titleKey: "heroSale",
    subtitleKey: "heroSaleSubtitle",
    ctaHref: "/catalog?onSale=true",
    ctaKey: "heroShopSale",
    image: banner2,
  },
  {
    badge: "Just Arrived",
    titleKey: "heroNew",
    subtitleKey: "heroNewSubtitle",
    ctaHref: "/catalog?sort=newest",
    ctaKey: "heroExplore",
    image: banner3,
  },
];

export function HeroBanner() {
  const t = useTranslations("home");
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="group relative flex min-h-[520px] items-center overflow-hidden md:min-h-[600px] lg:min-h-[680px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0 z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_right]"
            priority={current === 0}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_right,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_40%,rgba(0,0,0,0.05)_100%)]" />

      <div className="relative z-[5] mx-auto w-full max-w-container px-6 py-16 md:px-8 md:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="max-w-[560px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {slide.badge && (
              <motion.div
                className="mb-6 inline-flex items-center gap-2 rounded-pill border border-white/20 bg-white/15 px-4 py-2 text-[0.8125rem] font-semibold text-white backdrop-blur-[8px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Sparkles size={14} />
                {slide.badge}
              </motion.div>
            )}

            <motion.h1
              className="mb-4 font-display text-[2.75rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.2)] md:text-[3.5rem] lg:text-[4rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {t(slide.titleKey).split(" ").map((word, i, arr) =>
                i >= arr.length - 2 ? (
                  <span key={i} className="text-[#FF8A65]">
                    {word}{" "}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </motion.h1>

            <motion.p
              className="mb-8 max-w-[440px] text-[1.0625rem] leading-[1.6] text-white/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.15)] md:text-[1.125rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {t(slide.subtitleKey)}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <Link
                href={slide.ctaHref}
                className="inline-flex cursor-pointer items-center gap-2 rounded-pill border-none bg-accent px-8 py-3.5 text-[0.9375rem] font-bold text-white no-underline transition-[transform,box-shadow,background] duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(229,57,53,0.4)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {t(slide.ctaKey)} <ArrowRight size={16} />
              </Link>
              {slide.secondaryCtaHref && slide.secondaryCtaKey && (
                <Link
                  href={slide.secondaryCtaHref}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-white/30 bg-white/15 px-8 py-3.5 text-[0.9375rem] font-semibold text-white no-underline backdrop-blur-[8px] transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  {t(slide.secondaryCtaKey)}
                </Link>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-pill border border-white/30 bg-white/10 text-white opacity-0 backdrop-blur-[8px] transition-all duration-200 hover:border-accent hover:bg-accent group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:left-8"
        onClick={prev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-pill border border-white/30 bg-white/10 text-white opacity-0 backdrop-blur-[8px] transition-all duration-200 hover:border-accent hover:bg-accent group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:right-8"
        onClick={next}
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={clsx(
              "h-2 cursor-pointer rounded-pill border-none p-0 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              i === current ? "w-8 bg-white opacity-100" : "w-2 bg-white/40",
            )}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

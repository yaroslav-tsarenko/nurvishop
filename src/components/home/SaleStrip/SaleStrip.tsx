"use client";

import { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { useCurrency } from "@/providers/CurrencyProvider";
import { getProductImage, getProductImageFallback, shouldUnoptimizeImage } from "@/lib/utils/product-image";
import { getDiscountPercent, type HomepageProduct } from "@/lib/homepage-products";

interface Props {
  products: HomepageProduct[];
}

export function SaleStrip({ products }: Props) {
  const { currency, convert } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-40px" });

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section
      ref={sectionRef}
      className="mb-6 rounded-md border border-line bg-surface px-5 py-4"
    >
      <motion.div
        className="mb-3 flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={isInView ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
          >
            <Flame size={18} className="text-danger" />
          </motion.div>
          <h2 className="m-0 text-base font-extrabold text-ink">Hot Deals</h2>
          <span className="rounded-[4px] bg-danger px-2 py-0.5 text-[0.65rem] font-bold uppercase text-white">
            Sale
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/catalog?sort=price-asc&onSale=true"
            className="flex items-center gap-0.5 whitespace-nowrap text-[0.8125rem] font-semibold text-danger no-underline transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            View all <ChevronRight size={14} />
          </Link>
          <div className="flex gap-1">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-200 hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-200 hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              onClick={() => scroll(1)}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
      <div className="relative">
        <div
          className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={scrollRef}
        >
          {products.map((p, i) => {
            const discount = getDiscountPercent(p);
            const imgUrl = getProductImage(p.images?.[0]?.url, p.name);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}
              >
                <Link
                  href={`/product/${p.slug}`}
                  className="relative flex w-[160px] flex-shrink-0 flex-col rounded-md border border-line bg-surface p-3 text-ink no-underline transition-[border-color,box-shadow] duration-200 hover:border-line-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 max-[480px]:w-[140px]"
                >
                  {discount > 0 && (
                    <span className="absolute left-1.5 top-1.5 z-[1] rounded-[4px] bg-danger px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
                      -{discount}%
                    </span>
                  )}
                  <div className="relative mb-2 flex h-[100px] items-center justify-center rounded-[6px] bg-[#FEFEFE] max-[480px]:h-20">
                    <Image
                      src={imgUrl}
                      alt={p.name}
                      width={120}
                      height={100}
                      className="max-h-full max-w-full rounded-[4px] object-contain"
                      unoptimized={shouldUnoptimizeImage(imgUrl)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getProductImageFallback("120x100");
                      }}
                    />
                  </div>
                  <h4 className="m-0 mb-1.5 line-clamp-2 min-h-[2.6em] text-xs font-semibold leading-tight">
                    {p.name}
                  </h4>
                  <div className="mt-auto flex items-baseline gap-1.5">
                    <span className="text-[0.9375rem] font-extrabold text-danger">
                      {formatPrice(convert(Number(p.price)), currency)}
                    </span>
                    {p.comparePrice && (
                      <span className="text-[0.7rem] text-subtle line-through">
                        {formatPrice(convert(Number(p.comparePrice)), currency)}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

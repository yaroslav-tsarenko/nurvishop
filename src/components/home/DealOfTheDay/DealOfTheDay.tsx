"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { useCurrency } from "@/providers/CurrencyProvider";
import { getProductImage, getProductImageFallback, shouldUnoptimizeImage } from "@/lib/utils/product-image";
import { getDiscountPercent, type HomepageProduct } from "@/lib/homepage-products";

interface Props {
  product: HomepageProduct;
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

export function DealOfTheDay({ product }: Props) {
  const { currency, convert } = useCurrency();
  const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    setTime(getTimeUntilMidnight());
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const discount = getDiscountPercent(product);
  const imgUrl = getProductImage(product.images?.[0]?.url, product.name);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.section
      ref={ref}
      className="relative mb-6 flex items-stretch overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(135deg,#2b241d_0%,#5c3a2a_50%,#2b241d_100%)] text-white max-md:flex-col before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_80%_30%,rgba(217,164,65,0.18)_0%,transparent_60%),radial-gradient(circle_at_20%_80%,rgba(184,92,56,0.18)_0%,transparent_50%)]"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative z-[1] flex flex-1 flex-col justify-center px-10 py-8 max-md:p-6"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <motion.span
            className="rounded-pill bg-accent px-2.5 py-[0.2rem] text-[0.65rem] font-bold uppercase tracking-wide text-white"
            animate={isInView ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
          >
            Deal of the Day
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="min-w-8 rounded-sm bg-white/[0.12] px-2 py-1 text-center text-[0.8125rem] font-bold tabular-nums backdrop-blur-[4px]">{pad(time?.h ?? 0)}</span>
            <span className="text-xs opacity-50">:</span>
            <span className="min-w-8 rounded-sm bg-white/[0.12] px-2 py-1 text-center text-[0.8125rem] font-bold tabular-nums backdrop-blur-[4px]">{pad(time?.m ?? 0)}</span>
            <span className="text-xs opacity-50">:</span>
            <span className="min-w-8 rounded-sm bg-white/[0.12] px-2 py-1 text-center text-[0.8125rem] font-bold tabular-nums backdrop-blur-[4px]">{pad(time?.s ?? 0)}</span>
          </div>
        </div>
        <h2 className="m-0 mb-1.5 font-display text-2xl font-extrabold leading-[1.2] tracking-tight max-md:text-xl">{product.name}</h2>
        <p className="m-0 mb-5 max-w-[360px] text-sm leading-[1.5] opacity-70">
          Limited time offer — grab it before the deal expires!
        </p>
        <div className="mb-5 flex items-baseline gap-3">
          <span className="text-[1.75rem] font-extrabold text-pop max-md:text-[1.375rem]">{formatPrice(convert(Number(product.price)), currency)}</span>
          {product.comparePrice && (
            <span className="text-base line-through opacity-50">{formatPrice(convert(Number(product.comparePrice)), currency)}</span>
          )}
          {discount > 0 && <span className="rounded-pill bg-pop/20 px-2 py-[0.2rem] text-xs font-bold text-pop">-{discount}%</span>}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border-none bg-accent px-7 py-3 text-sm font-bold text-white no-underline transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Shop Now <ArrowRight size={16} />
        </Link>
      </motion.div>
      <motion.div
        className="relative z-[1] flex w-[280px] flex-shrink-0 items-center justify-center p-6 max-md:w-full max-md:px-6 max-md:pb-6 max-md:pt-0"
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <motion.div
          className="flex items-center justify-center rounded-2xl bg-[#FEFEFE] p-5 shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image
            src={imgUrl}
            alt={product.name}
            width={240}
            height={200}
            className="max-h-[180px] max-w-full object-contain"
            unoptimized={shouldUnoptimizeImage(imgUrl)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = getProductImageFallback("240x200");
            }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

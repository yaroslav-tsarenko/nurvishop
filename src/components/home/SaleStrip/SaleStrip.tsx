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
import styles from "./SaleStrip.module.css";

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
    <section ref={sectionRef} className={styles.section}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerLeft}>
          <motion.div
            animate={isInView ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
          >
            <Flame size={18} className={styles.fireIcon} />
          </motion.div>
          <h2 className={styles.title}>Hot Deals</h2>
          <span className={styles.badge}>Sale</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/catalog?sort=price-asc&onSale=true" className={styles.viewAll}>
            View all <ChevronRight size={14} />
          </Link>
          <div className={styles.arrows}>
            <button className={styles.arrow} onClick={() => scroll(-1)} aria-label="Scroll left">
              <ChevronLeft size={16} />
            </button>
            <button className={styles.arrow} onClick={() => scroll(1)} aria-label="Scroll right">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
      <div className={styles.scrollWrap}>
        <div className={styles.track} ref={scrollRef}>
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
                <Link href={`/product/${p.slug}`} className={styles.card}>
                  {discount > 0 && (
                    <span className={styles.discountBadge}>-{discount}%</span>
                  )}
                  <div className={styles.imageWrap}>
                    <Image
                      src={imgUrl}
                      alt={p.name}
                      width={120}
                      height={100}
                      className={styles.image}
                      unoptimized={shouldUnoptimizeImage(imgUrl)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getProductImageFallback("120x100");
                      }}
                    />
                  </div>
                  <h4 className={styles.cardName}>{p.name}</h4>
                  <div className={styles.prices}>
                    <span className={styles.newPrice}>{formatPrice(convert(Number(p.price)), currency)}</span>
                    {p.comparePrice && (
                      <span className={styles.oldPrice}>{formatPrice(convert(Number(p.comparePrice)), currency)}</span>
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

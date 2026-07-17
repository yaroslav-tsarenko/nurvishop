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
import styles from "./DealOfTheDay.module.css";

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
  const [time, setTime] = useState(getTimeUntilMidnight);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const discount = getDiscountPercent(product);
  const imgUrl = getProductImage(product.images?.[0]?.url, product.name);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.section
      ref={ref}
      className={styles.section}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={styles.textSide}
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className={styles.topRow}>
          <motion.span
            className={styles.badge}
            animate={isInView ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
          >
            Deal of the Day
          </motion.span>
          <div className={styles.timer}>
            <span className={styles.timeBlock}>{pad(time.h)}</span>
            <span className={styles.timeSep}>:</span>
            <span className={styles.timeBlock}>{pad(time.m)}</span>
            <span className={styles.timeSep}>:</span>
            <span className={styles.timeBlock}>{pad(time.s)}</span>
          </div>
        </div>
        <h2 className={styles.title}>{product.name}</h2>
        <p className={styles.subtitle}>
          Limited time offer — grab it before the deal expires!
        </p>
        <div className={styles.priceRow}>
          <span className={styles.newPrice}>{formatPrice(convert(Number(product.price)), currency)}</span>
          {product.comparePrice && (
            <span className={styles.oldPrice}>{formatPrice(convert(Number(product.comparePrice)), currency)}</span>
          )}
          {discount > 0 && <span className={styles.discountTag}>-{discount}%</span>}
        </div>
        <Link href={`/product/${product.slug}`} className={styles.cta}>
          Shop Now <ArrowRight size={16} />
        </Link>
      </motion.div>
      <motion.div
        className={styles.imageSide}
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image
            src={imgUrl}
            alt={product.name}
            width={240}
            height={200}
            className={styles.productImage}
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

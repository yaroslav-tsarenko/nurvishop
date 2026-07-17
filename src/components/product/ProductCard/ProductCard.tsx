"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShoppingCart, Heart, ImageOff } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { useCart } from "@/providers/CartProvider";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  imageUrl?: string | null;
  category?: string;
  quantity: number;
}

export function ProductCard({
  id,
  name,
  slug,
  sku,
  price,
  comparePrice,
  imageUrl,
  category,
  quantity,
}: ProductCardProps) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const isOnSale = comparePrice && comparePrice > price;
  const outOfStock = quantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: id,
      name,
      slug,
      sku,
      price,
      quantity: 1,
      imageUrl: imageUrl || null,
      maxQuantity: quantity,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link href={`/product/${slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <div className={styles.imageInner}>
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={styles.image}
              unoptimized={shouldUnoptimizeImage(imageUrl)}
            />
          </div>
        ) : (
          <div className={styles.noImage}>
            <ImageOff size={32} />
            No Image
          </div>
        )}

        {isOnSale && (
          <span className={`${styles.badge} ${styles.saleBadge}`}>Sale</span>
        )}
        {outOfStock && (
          <span className={`${styles.badge} ${styles.outOfStock}`}>
            {t("outOfStock")}
          </span>
        )}

        <button
          className={styles.wishlistBtn}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={14} />
        </button>
      </div>

      <div className={styles.content}>
        {category && <span className={styles.category}>{category}</span>}
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.footer}>
          <PriceDisplay price={price} comparePrice={comparePrice} size="sm" />
          <button
            className={`${styles.addBtn} ${outOfStock ? styles.addBtnDisabled : ""}`}
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={t("addToCart")}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}

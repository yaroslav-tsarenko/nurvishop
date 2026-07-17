"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback, shouldUnoptimizeImage } from "@/lib/utils/product-image";
import styles from "./MarketplaceProductCard.module.css";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    comparePrice?: number | string | null;
    images: { url: string; alt?: string | null }[];
    categories?: { category: { name: string; slug: string } }[];
    quantity?: number;
    status?: string;
    isFeatured?: boolean;
    brand?: string | null;
  };
}

export function MarketplaceProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { currency, convert } = useCurrency();
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;
  const inStock = product.quantity === undefined || product.quantity > 0;
  const imageUrl = product.images?.[0]?.url;
  const imgSrc = getProductImage(imageUrl, product.name);
  const category = product.categories?.[0]?.category;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price,
      imageUrl: imgSrc,
      quantity: 1,
      slug: product.slug,
      sku: product.id,
      maxQuantity: product.quantity ?? 99,
    });
  };

  return (
    <Link href={`/product/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={imgSrc}
          alt={product.images?.[0]?.alt || product.name}
          width={200}
          height={200}
          className={styles.image}
          unoptimized={shouldUnoptimizeImage(imgSrc)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getProductImageFallback();
          }}
        />
        {hasDiscount && (
          <span className={styles.discountBadge}>-{discountPercent}%</span>
        )}
        {!inStock && <span className={styles.oosOverlay}>Out of Stock</span>}
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Add to wishlist"
          >
            <Heart size={15} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Quick view"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {category && (
          <span className={styles.category}>{category.name}</span>
        )}
        <h4 className={styles.name}>{product.name}</h4>
        <div className={styles.rating}>
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={11} fill={s <= 4 ? "#FF9800" : "none"} stroke={s <= 4 ? "#FF9800" : "#ccc"} />
          ))}
          <span className={styles.ratingCount}>(12)</span>
        </div>
        <div className={styles.priceRow}>
          <div className={styles.prices}>
            <span className={styles.price}>{formatPrice(convert(price), currency)}</span>
            {hasDiscount && (
              <span className={styles.oldPrice}>{formatPrice(convert(comparePrice), currency)}</span>
            )}
          </div>
          <button
            className={`${styles.cartBtn} ${!inStock ? styles.cartBtnDisabled : ""}`}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
        {inStock ? (
          <span className={styles.stockIn}>In stock</span>
        ) : (
          <span className={styles.stockOut}>Out of stock</span>
        )}
      </div>
    </Link>
  );
}

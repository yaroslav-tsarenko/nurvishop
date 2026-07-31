"use client";

import Image from "next/image";
import clsx from "clsx";
import { Link } from "@/i18n/routing";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback, shouldUnoptimizeImage } from "@/lib/utils/product-image";

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
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface text-ink no-underline shadow-card transition-[border-color,box-shadow,transform] duration-200 ease-back hover:-translate-y-1 hover:border-accent-light hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#FEFEFE] p-3">
        <Image
          src={imgSrc}
          alt={product.images?.[0]?.alt || product.name}
          width={200}
          height={200}
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          unoptimized={shouldUnoptimizeImage(imgSrc)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getProductImageFallback();
          }}
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-pill bg-pop px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-pop-ink">
            -{discountPercent}%
          </span>
        )}
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-surface/75 text-[0.8125rem] font-semibold text-muted">
            Out of Stock
          </span>
        )}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-100 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Add to wishlist"
          >
            <Heart size={15} />
          </button>
          <button
            className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-100 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Quick view"
          >
            <Eye size={15} />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        {category && (
          <span className="mb-1 text-xs uppercase tracking-wide text-muted">{category.name}</span>
        )}
        <h4 className="mb-1.5 line-clamp-2 text-[0.8125rem] font-semibold leading-[1.35] text-ink sm:text-[0.8125rem]">
          {product.name}
        </h4>
        <div className="mb-2 flex items-center gap-px">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} size={11} fill={s <= 4 ? "var(--ochre)" : "none"} stroke={s <= 4 ? "var(--ochre)" : "var(--color-border)"} />
          ))}
          <span className="ml-1 text-[0.65rem] text-muted">(12)</span>
        </div>
        <div className="mb-1.5 mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base font-medium text-ink">{formatPrice(convert(price), currency)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">{formatPrice(convert(comparePrice), currency)}</span>
            )}
          </div>
          <button
            className={clsx(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-pill text-white transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              inStock ? "bg-accent hover:bg-accent-hover" : "cursor-not-allowed bg-well text-subtle",
            )}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label="Add to cart"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
        {inStock ? (
          <span className="text-[0.65rem] font-medium text-success">In stock</span>
        ) : (
          <span className="text-[0.65rem] font-medium text-danger">Out of stock</span>
        )}
      </div>
    </Link>
  );
}

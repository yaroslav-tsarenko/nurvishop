"use client";

import Image from "next/image";
import clsx from "clsx";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShoppingCart, Heart, ImageOff } from "lucide-react";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { useCart } from "@/providers/CartProvider";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";

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
    <Link
      href={`/product/${slug}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1.5 hover:border-accent hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className="relative aspect-square overflow-hidden bg-[#FEFEFE]">
        {imageUrl ? (
          <div className="absolute inset-1.5 sm:inset-3">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain transition-transform duration-[600ms] ease-out-expo group-hover:scale-[1.06]"
              unoptimized={shouldUnoptimizeImage(imageUrl)}
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[0.8125rem] text-subtle">
            <ImageOff size={32} />
            No Image
          </div>
        )}

        {isOnSale && (
          <span className="absolute left-3 top-3 z-[4] rounded-pill bg-pop px-3 py-[0.3rem] text-[0.6875rem] font-bold uppercase tracking-wide text-pop-ink">
            Sale
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-3 top-3 z-[4] rounded-pill bg-subtle px-3 py-[0.3rem] text-[0.6875rem] font-bold uppercase tracking-wide text-white">
            {t("outOfStock")}
          </span>
        )}

        <button
          className="absolute right-3 top-3 z-[4] flex h-8 w-8 items-center justify-center rounded-pill bg-surface text-subtle opacity-0 shadow-sm transition-[transform,color] duration-150 hover:scale-[1.15] hover:text-danger group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={14} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
        {category && (
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted sm:text-[0.6875rem]">
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-[calc(0.8125rem*1.35*2)] break-words text-[0.8125rem] font-semibold leading-[1.35] text-ink [overflow-wrap:anywhere] sm:min-h-[calc(0.9375rem*1.4*2)] sm:text-[0.9375rem] sm:leading-[1.4]">
          {name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceDisplay price={price} comparePrice={comparePrice} size="sm" />
          <button
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-[background-color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:h-9 sm:w-9",
              outOfStock
                ? "cursor-not-allowed bg-accent-light text-accent opacity-40"
                : "bg-accent-light text-accent hover:scale-[1.08] hover:bg-accent hover:text-white active:scale-95",
            )}
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

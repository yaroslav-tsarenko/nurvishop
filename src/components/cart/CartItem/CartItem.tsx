"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { useCart } from "@/providers/CartProvider";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-line py-5 first:pt-0">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-well to-mist">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="80px"
            style={{ objectFit: "contain", padding: "4px" }}
            unoptimized={shouldUnoptimizeImage(item.imageUrl)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[0.625rem] text-subtle">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-[0.9375rem] font-semibold">{item.name}</h3>
        {item.variantName && (
          <span className="text-xs text-subtle">{item.variantName}</span>
        )}
        <div className="mt-auto flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            maxQuantity={item.maxQuantity}
            onChange={(qty) => updateQuantity(item.productId, qty, item.variantId)}
          />
          <div className="flex items-center gap-3">
            <PriceDisplay price={item.price * item.quantity} size="sm" />
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              onPress={() => removeItem(item.productId, item.variantId)}
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/shared/QuantitySelector/QuantitySelector";
import { PriceDisplay } from "@/components/shared/PriceDisplay/PriceDisplay";
import { useCart } from "@/providers/CartProvider";
import { shouldUnoptimizeImage } from "@/lib/utils/product-image";
import type { CartItem as CartItemType } from "@/types/cart";
import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className={styles.item}>
      <div className={styles.image}>
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
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
            No Image
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        {item.variantName && (
          <span className={styles.variant}>{item.variantName}</span>
        )}
        <div className={styles.footer}>
          <QuantitySelector
            quantity={item.quantity}
            maxQuantity={item.maxQuantity}
            onChange={(qty) => updateQuantity(item.productId, qty, item.variantId)}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";

interface CartToastProps {
  name: string;
  imageUrl?: string | null;
  quantity: number;
}

export function CartToast({ name, imageUrl, quantity }: CartToastProps) {
  return (
    <motion.div
      className="flex min-w-[280px] items-center gap-3 px-4 py-3"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
    >
      <motion.div
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success text-white"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 15, stiffness: 400 }}
      >
        <Check size={14} strokeWidth={3} />
      </motion.div>

      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-well text-subtle">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="48px" style={{ objectFit: "contain" }} />
        ) : (
          <ShoppingCart size={20} />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-bold uppercase tracking-wide text-success">Added to cart</span>
        <span className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-semibold text-ink">
          {name}
        </span>
        {quantity > 1 && <span className="text-[0.6875rem] text-subtle">Qty: {quantity}</span>}
      </div>
    </motion.div>
  );
}

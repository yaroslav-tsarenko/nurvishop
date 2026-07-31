"use client";

import { useTranslations } from "next-intl";
import { Leaf, RotateCcw, Headphones, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const promos = [
  { icon: <Leaf size={22} />, titleKey: "promoFreeShipping" as const, descKey: "promoFreeShippingDesc" as const },
  { icon: <RotateCcw size={22} />, titleKey: "promoReturns" as const, descKey: "promoReturnsDesc" as const },
  { icon: <Headphones size={22} />, titleKey: "promoSupport" as const, descKey: "promoSupportDesc" as const },
  { icon: <ShieldCheck size={22} />, titleKey: "promoSecure" as const, descKey: "promoSecureDesc" as const },
];

export function PromoBar() {
  const t = useTranslations("home");

  return (
    <section className="border-b border-line bg-surface px-4 py-12">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
        {promos.map((promo, i) => (
          <motion.div
            key={promo.titleKey}
            className="flex items-center gap-4 rounded-xl border border-line bg-mist p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-accent-light text-accent">
              {promo.icon}
            </div>
            <div>
              <p className="text-[0.8125rem] font-bold leading-tight text-ink">{t(promo.titleKey)}</p>
              <p className="mt-0.5 text-xs text-muted">{t(promo.descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { motion, useInView } from "framer-motion";

const items = [
  { icon: Truck, label: "Free Shipping", desc: "On orders over €100", tint: "bg-lilac", iconColor: "text-accent" },
  { icon: ShieldCheck, label: "Secure Payment", desc: "100% protected checkout", tint: "bg-success-tint", iconColor: "text-success" },
  { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy", tint: "bg-pop-tint", iconColor: "text-warning" },
  { icon: Headphones, label: "24/7 Support", desc: "We're always here to help", tint: "bg-blush-tint", iconColor: "text-blush" },
];

export function TrustStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <section
      ref={ref}
      className="mb-6 grid grid-cols-1 gap-1 rounded-xl border border-line bg-surface p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="flex items-center gap-3 py-2 lg:not-last:border-r lg:not-last:border-line lg:not-last:pr-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <motion.div
            className={`flex size-10 shrink-0 items-center justify-center rounded-md ${item.tint}`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <item.icon size={20} className={item.iconColor} />
          </motion.div>
          <div>
            <p className="mb-0.5 text-[0.8125rem] font-bold leading-tight text-ink">{item.label}</p>
            <p className="text-[0.7rem] leading-tight text-subtle">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

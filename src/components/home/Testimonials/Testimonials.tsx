"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import { motion, useInView } from "framer-motion";

const reviews = [
  {
    quote: "The linen bedding is impossibly soft and only gets better with every wash. It transformed our bedroom into a calm retreat.",
    name: "Elena M.",
    location: "Riga",
    initial: "E",
    tint: "bg-sage-tint",
    ink: "text-sage",
  },
  {
    quote: "Beautiful stoneware that feels handmade. You can tell real care went into every piece — it's now our everyday tableware.",
    name: "Tomas B.",
    location: "London",
    initial: "T",
    tint: "bg-peach",
    ink: "text-accent",
  },
  {
    quote: "Warm, tactile and thoughtfully made. The oak shelving anchors our living room perfectly and the support was lovely.",
    name: "Sofia K.",
    location: "Vilnius",
    initial: "S",
    tint: "bg-sand",
    ink: "text-ochre",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="mb-6">
      <div className="mb-6 text-center">
        <p className="eyebrow text-accent">Loved at home</p>
        <h2 className="font-display text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
          Words from our customers
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.figure
            key={r.name}
            className="flex flex-col rounded-2xl border border-line bg-surface p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={15} className="fill-ochre text-ochre" />
              ))}
            </div>
            <blockquote className="mb-5 flex-1 font-display text-[1.0625rem] italic leading-relaxed text-ink">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-3">
              <span className={`flex size-10 items-center justify-center rounded-full font-display text-base font-semibold ${r.tint} ${r.ink}`}>
                {r.initial}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-ink">{r.name}</span>
                <span className="text-xs text-subtle">{r.location}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

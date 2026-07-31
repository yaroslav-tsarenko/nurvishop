"use client";

import { useRef } from "react";
import { Leaf, Flame, TreePine, Mountain } from "lucide-react";
import { motion, useInView } from "framer-motion";

const materials = [
  { icon: Leaf, name: "Linen", desc: "Breathable, soft-washed and better with every wash.", tint: "bg-sage-tint", iconColor: "text-sage" },
  { icon: Flame, name: "Clay", desc: "Hand-finished terracotta and glazed stoneware.", tint: "bg-peach", iconColor: "text-accent" },
  { icon: TreePine, name: "Oak", desc: "Warm, solid timber that ages gracefully.", tint: "bg-sand", iconColor: "text-ochre" },
  { icon: Mountain, name: "Stone", desc: "Cool, tactile marble and natural stoneware.", tint: "bg-mist", iconColor: "text-muted" },
];

export function MaterialsBand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="grid gap-px bg-line md:grid-cols-[1.1fr_2fr]">
        <div className="flex flex-col justify-center gap-3 bg-clay-white p-8 md:p-10">
          <p className="eyebrow text-accent">Materials we love</p>
          <h2 className="font-display text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
            Made from things that <span className="italic text-accent">age well</span>.
          </h2>
          <p className="max-w-[340px] text-sm leading-relaxed text-muted">
            We choose honest, natural materials — the kind that soften, patina and feel
            better the longer they live in your home.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {materials.map((m, i) => (
            <motion.div
              key={m.name}
              className="flex flex-col gap-3 bg-surface p-6 transition-colors duration-200 hover:bg-mist"
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className={`flex size-11 items-center justify-center rounded-xl ${m.tint}`}>
                <m.icon size={22} className={m.iconColor} />
              </span>
              <div>
                <p className="mb-1 font-display text-lg font-semibold text-ink">{m.name}</p>
                <p className="text-[0.8125rem] leading-relaxed text-subtle">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

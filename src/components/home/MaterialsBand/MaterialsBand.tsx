"use client";

import { useRef } from "react";
import { Leaf, Flame, TreePine, Mountain } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";

// Copy lives in messages under home.materials.items.<key>.{name,desc}.
const materials = [
  { key: "linen", icon: Leaf, tint: "bg-sage-tint", iconColor: "text-sage" },
  { key: "clay", icon: Flame, tint: "bg-peach", iconColor: "text-accent" },
  { key: "oak", icon: TreePine, tint: "bg-sand", iconColor: "text-ochre" },
  { key: "stone", icon: Mountain, tint: "bg-mist", iconColor: "text-muted" },
] as const;

export function MaterialsBand() {
  const t = useTranslations("home.materials");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="grid gap-px bg-line md:grid-cols-[1.1fr_2fr]">
        <div className="flex flex-col justify-center gap-3 bg-clay-white p-8 md:p-10">
          <p className="eyebrow text-accent">{t("eyebrow")}</p>
          <h2 className="font-display text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.02em] text-ink">
            {t.rich("title", {
              em: (chunks) => <span className="italic text-accent">{chunks}</span>,
            })}
          </h2>
          <p className="max-w-[340px] text-sm leading-relaxed text-muted">
            {t("text")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {materials.map((m, i) => (
            <motion.div
              key={m.key}
              className="flex flex-col gap-3 bg-surface p-6 transition-colors duration-200 hover:bg-mist"
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span className={`flex size-11 items-center justify-center rounded-xl ${m.tint}`}>
                <m.icon size={22} className={m.iconColor} />
              </span>
              <div>
                <p className="mb-1 font-display text-lg font-semibold text-ink">{t(`items.${m.key}.name`)}</p>
                <p className="text-[0.8125rem] leading-relaxed text-subtle">{t(`items.${m.key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

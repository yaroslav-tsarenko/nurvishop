"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function EditorialQuote() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative mb-6 overflow-hidden rounded-2xl bg-inverse px-6 py-14 text-center shadow-card md:py-20"
    >
      {/* soft decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-blob bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-blob bg-ochre/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-40 w-40 rounded-blob bg-sage/20 blur-3xl" />

      <motion.div
        className="relative z-[1] mx-auto max-w-[720px]"
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <span className="mb-5 inline-block font-display text-5xl leading-none text-accent">&ldquo;</span>
        <p className="font-display text-[1.6rem] font-medium italic leading-[1.4] tracking-[-0.01em] text-inverse-fg md:text-[2rem]">
          A home should feel like a slow exhale — warm textures, honest materials
          and objects that earn their place over time.
        </p>
        <p className="mt-6 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-inverse-muted">
          The nurvishop philosophy
        </p>
      </motion.div>
    </section>
  );
}

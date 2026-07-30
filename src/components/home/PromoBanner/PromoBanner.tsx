"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function PromoBanner() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/catalog?onSale=true"
              className="group relative block min-h-[260px] overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="absolute inset-0 bg-accent" />
              <div className="relative z-[1] flex h-full min-h-[260px] flex-col justify-end p-10 text-white">
                <span className="mb-2 text-xs font-bold uppercase tracking-[0.08em] opacity-80">
                  Limited Offer
                </span>
                <h3 className="mb-2 text-[2rem] font-extrabold tracking-[-0.03em]">Up to 40% off</h3>
                <p className="mb-5 max-w-[280px] text-[0.9375rem] leading-normal opacity-85">
                  Don&apos;t miss our biggest sale of the season
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-[8px] transition-[background-color,gap] duration-200 group-hover:gap-3 group-hover:bg-white/30">
                  Shop now <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/catalog?sort=newest"
              className="group relative block min-h-[260px] overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="absolute inset-0 bg-blush" />
              <div className="relative z-[1] flex h-full min-h-[260px] flex-col justify-end p-10 text-white">
                <span className="mb-2 text-xs font-bold uppercase tracking-[0.08em] opacity-80">
                  Just Arrived
                </span>
                <h3 className="mb-2 text-[2rem] font-extrabold tracking-[-0.03em]">New Collection</h3>
                <p className="mb-5 max-w-[280px] text-[0.9375rem] leading-normal opacity-85">
                  Explore the latest trends and must-have items
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-[8px] transition-[background-color,gap] duration-200 group-hover:gap-3 group-hover:bg-white/30">
                  Explore <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

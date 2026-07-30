"use client";

import { useState, useMemo, useRef } from "react";
import clsx from "clsx";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { MarketplaceProductCard } from "../MarketplaceProductCard/MarketplaceProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  comparePrice?: number | string | null;
  images: { url: string; alt?: string | null }[];
  categories?: { category: { name: string; slug: string } }[];
  quantity?: number;
  status?: string;
  isFeatured?: boolean;
  brand?: string | null;
}

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  tabs?: string[];
  bg?: "white" | "gray";
  columns?: number;
}

export function ProductSection({
  title, subtitle, products, viewAllHref, viewAllLabel, tabs, bg = "white", columns = 5,
}: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const filtered = useMemo(() => {
    if (!tabs || tabs.length === 0 || activeTab === 0) return products;
    const tabName = tabs[activeTab];
    return products.filter((p) =>
      p.categories?.some((c) => c.category.name === tabName)
    );
  }, [products, tabs, activeTab]);

  if (!products.length) return null;

  return (
    <section
      ref={ref}
      className={clsx("mb-6", bg === "gray" && "rounded-lg bg-mist p-5")}
    >
      <motion.div
        className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-baseline gap-2">
          <h2 className="m-0 whitespace-nowrap text-lg font-extrabold text-ink">{title}</h2>
          {subtitle && <span className="whitespace-nowrap text-xs text-muted">{subtitle}</span>}
        </div>
        {tabs && tabs.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                className={clsx(
                  "whitespace-nowrap rounded-md border px-3 py-[0.3rem] text-xs transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                  i === activeTab
                    ? "border-accent bg-lilac text-accent"
                    : "border-line bg-surface text-muted hover:border-line-hover hover:text-ink",
                )}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-0.5 whitespace-nowrap text-[0.8125rem] font-semibold text-accent transition-opacity duration-100 hover:opacity-80 sm:ml-auto"
          >
            {viewAllLabel || "View all"} <ChevronRight size={14} />
          </Link>
        )}
      </motion.div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: Math.min(i * 0.07, 0.5) }}
          >
            <MarketplaceProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

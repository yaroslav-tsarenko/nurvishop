"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { motion, useInView } from "framer-motion";
import { Package } from "lucide-react";

const COLORS = [
  "#EDE9FE", "#FCE7F3", "#DCFCE7", "#FEF3C7",
  "#DBEAFE", "#E0E7FF", "#F3E8FF", "#FEE2E2",
  "#CFFAFE", "#FFF7ED", "#ECFDF5", "#FEF9C3",
];

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface Props {
  categories: CategoryItem[];
}

export function CategoryShowcase({ categories }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  if (categories.length === 0) return null;

  return (
    <section ref={ref} className="mb-6">
      <motion.div
        className="mb-4 flex items-center justify-between"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <h2 className="m-0 font-display text-lg font-extrabold tracking-tight text-ink">Shop by Category</h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-2 min-[481px]:gap-3 md:grid-cols-3 min-[1201px]:grid-cols-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, delay: i * 0.06 }}
          >
            <Link
              href={`/catalog/${cat.slug}`}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2.5 text-ink no-underline transition-[border-color,box-shadow] duration-200 ease-out hover:border-line-hover hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 min-[481px]:px-4 min-[481px]:py-3.5"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                <Package size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="m-0 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-bold">{cat.name}</h3>
                <span className="text-[0.7rem] text-subtle">{cat.productCount} products</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

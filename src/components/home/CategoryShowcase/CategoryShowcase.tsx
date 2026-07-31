"use client";

import { useRef } from "react";
import { Link } from "@/i18n/routing";
import { motion, useInView } from "framer-motion";
import {
  Sofa, BedDouble, CookingPot, Bath, Lamp, Armchair,
  Package, Flower2, Shirt, UtensilsCrossed, LayoutGrid,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  living: Sofa, sofa: Sofa, couch: Sofa,
  chair: Armchair, seating: Armchair, furniture: Armchair,
  bed: BedDouble, bedroom: BedDouble, sleep: BedDouble,
  kitchen: CookingPot, cook: CookingPot, cooking: CookingPot,
  dining: UtensilsCrossed, tableware: UtensilsCrossed, cutlery: UtensilsCrossed, glass: UtensilsCrossed,
  bath: Bath, bathroom: Bath, towel: Bath,
  light: Lamp, lighting: Lamp, lamp: Lamp,
  decor: Flower2, decoration: Flower2, vase: Flower2, candle: Flower2,
  textile: Shirt, linen: Shirt, cushion: Shirt, blanket: Shirt,
  storage: Package, organiz: Package, basket: Package, box: Package,
};

function iconFor(name: string) {
  const lower = name.toLowerCase();
  for (const [k, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(k)) return Icon;
  }
  return LayoutGrid;
}

const TINTS = [
  "bg-peach text-accent",
  "bg-sage-tint text-sage",
  "bg-[var(--ochre-tint)] text-[var(--ochre-hover)]",
  "bg-well text-muted",
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
        className="mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <p className="eyebrow mb-1">Explore the home</p>
        <h2 className="m-0 font-display text-xl font-semibold tracking-tight text-ink">
          Shop by room
        </h2>
      </motion.div>

      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible min-[1201px]:grid-cols-8">
        {categories.map((cat, i) => {
          const Icon = iconFor(cat.name);
          return (
            <motion.div
              key={cat.id}
              className="w-[132px] flex-shrink-0 snap-start md:w-auto"
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={`/catalog/${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-center text-ink no-underline transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-1 hover:border-accent hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-blob transition-transform duration-200 group-hover:scale-105 ${TINTS[i % TINTS.length]}`}
                >
                  <Icon size={26} />
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 truncate text-[0.85rem] font-semibold">
                    {cat.name}
                  </h3>
                  <span className="text-[0.7rem] text-subtle">
                    {cat.productCount} items
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

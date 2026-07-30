"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BrandData {
  id: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

interface Props {
  brands: BrandData[];
}

export function BrandStrip({ brands }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (!brands.length) return null;

  return (
    <div className="mb-6 rounded-md border border-line bg-surface px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-[0.9375rem] font-bold text-ink">Popular Brands</h3>
        <div className="flex gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-200 hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-200 hover:border-line-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={scrollRef}
      >
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={brand.linkUrl || "#"}
            className="flex min-w-[100px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md border border-line bg-mist px-5 py-2.5 transition-colors duration-200 hover:border-line-hover hover:bg-well"
          >
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="max-h-6 max-w-[80px] object-contain"
              />
            ) : (
              <span className="whitespace-nowrap text-[0.8125rem] font-semibold text-muted">
                {brand.name}
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

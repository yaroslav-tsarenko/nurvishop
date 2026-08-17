"use client";

import { useState } from "react";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: Category[];
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  selectedBrand: string;
  onCategoryChange: (slug: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onSaleChange: (value: boolean) => void;
  onBrandChange: (value: string) => void;
}

const categoryItemBase =
  "cursor-pointer rounded-md px-2.5 py-2 text-sm text-muted transition-colors duration-150 hover:bg-well hover:text-ink";
const categoryItemActive = "bg-lilac font-semibold text-accent";

function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-muted transition-colors duration-150 hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-[0.8125rem] font-bold uppercase tracking-wide text-ink">{title}</h3>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function CategoryItem({
  cat,
  depth,
  selectedCategory,
  onCategoryChange,
}: {
  cat: Category;
  depth: number;
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children && cat.children.length > 0;
  const isActive = selectedCategory === cat.slug;
  const count = cat._count?.products || 0;
  const alwaysExpanded = cat.slug === "home-and-cooking";
  const isExpanded = alwaysExpanded || expanded;

  return (
    <>
      <li
        className={clsx("flex items-center", categoryItemBase, isActive && categoryItemActive)}
        style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
      >
        <span
          onClick={() => onCategoryChange(cat.slug)}
          className="flex-1 cursor-pointer"
        >
          {cat.name}
          {count > 0 && (
            <span className="ml-1 text-xs text-subtle">({count})</span>
          )}
        </span>
        {hasChildren && !alwaysExpanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex cursor-pointer border-none bg-transparent p-0.5 text-subtle"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </li>
      {hasChildren && isExpanded && cat.children!.map((child) => (
        <CategoryItem
          key={child.id}
          cat={child}
          depth={depth + 1}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      ))}
    </>
  );
}

export function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  inStock,
  onSale,
  brands,
  selectedBrand,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
  onSaleChange,
  onBrandChange,
}: ProductFiltersProps) {
  const t = useTranslations("product");
  const nav = useTranslations("nav");

  return (
    <aside className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <FilterSection title={t("filterBy")}>
        {categories.length === 0 ? (
          <div className="flex flex-col">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-2">
                <div className="h-3 flex-1 animate-pulse rounded-md bg-well" style={{ width: `${50 + (i * 19) % 40}%` }} />
                <div className="h-3 w-5 animate-pulse rounded-md bg-well" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="m-0 flex max-h-[220px] list-none flex-col gap-0.5 overflow-y-auto p-0">
            <li
              className={clsx(categoryItemBase, !selectedCategory && categoryItemActive)}
              onClick={() => onCategoryChange("")}
            >
              {nav("allCategories")}
            </li>
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                depth={0}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
              />
            ))}
          </ul>
        )}
      </FilterSection>

      <FilterSection title={t("priceRange")}>
        <div className="mb-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors duration-200 focus:border-accent focus:outline-none"
          />
          <span className="flex-shrink-0 text-subtle">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition-colors duration-200 focus:border-accent focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button className="rounded-md border border-line bg-surface p-[0.4375rem] text-xs font-medium text-muted transition-[background-color,color,border-color] duration-150 hover:border-accent hover:bg-lilac hover:text-accent" onClick={() => { onMinPriceChange(""); onMaxPriceChange("25"); }}>Under €25</button>
          <button className="rounded-md border border-line bg-surface p-[0.4375rem] text-xs font-medium text-muted transition-[background-color,color,border-color] duration-150 hover:border-accent hover:bg-lilac hover:text-accent" onClick={() => { onMinPriceChange("25"); onMaxPriceChange("50"); }}>€25–€50</button>
          <button className="rounded-md border border-line bg-surface p-[0.4375rem] text-xs font-medium text-muted transition-[background-color,color,border-color] duration-150 hover:border-accent hover:bg-lilac hover:text-accent" onClick={() => { onMinPriceChange("50"); onMaxPriceChange("100"); }}>€50–€100</button>
          <button className="rounded-md border border-line bg-surface p-[0.4375rem] text-xs font-medium text-muted transition-[background-color,color,border-color] duration-150 hover:border-accent hover:bg-lilac hover:text-accent" onClick={() => { onMinPriceChange("100"); onMaxPriceChange(""); }}>€100+</button>
        </div>
      </FilterSection>

      {brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={false}>
          <ul className="m-0 flex max-h-[220px] list-none flex-col gap-0.5 overflow-y-auto p-0">
            <li
              className={clsx(categoryItemBase, !selectedBrand && categoryItemActive)}
              onClick={() => onBrandChange("")}
            >
              All Brands
            </li>
            {brands.map((brand) => (
              <li
                key={brand}
                className={clsx(categoryItemBase, selectedBrand === brand && categoryItemActive)}
                onClick={() => onBrandChange(brand)}
              >
                {brand}
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      <FilterSection title={t("availability")} defaultOpen={false}>
        <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-muted">
          <input type="checkbox" checked={inStock} onChange={(e) => onInStockChange(e.target.checked)} className="h-4 w-4 accent-accent" />
          <span>{t("inStock")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-muted">
          <input type="checkbox" checked={onSale} onChange={(e) => onSaleChange(e.target.checked)} className="h-4 w-4 accent-accent" />
          <span>On Sale</span>
        </label>
      </FilterSection>
    </aside>
  );
}

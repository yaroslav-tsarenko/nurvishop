"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { ChevronRight, ChevronDown, Menu, X } from "lucide-react";
import clsx from "clsx";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: Category[];
}

function CategoryItem({ cat, depth = 0, onNavigate }: { cat: Category; depth?: number; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  const count = cat._count?.products || 0;

  return (
    <>
      <div
        className="flex items-center border-b border-line last:border-b-0"
        style={{ paddingLeft: `${0.75 + depth * 0.75}rem` }}
      >
        <Link
          href={`/catalog/${cat.slug}`}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-0 pr-1 text-[0.8125rem] text-ink no-underline transition-colors duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={onNavigate}
        >
          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{cat.name}</span>
          {count > 0 && <span className="flex-shrink-0 text-[0.6875rem] text-subtle">{count}</span>}
        </Link>
        {hasChildren && (
          <button
            className="mr-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm text-subtle transition-[background,color] duration-200 hover:bg-well hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
      {hasChildren && expanded && cat.children!.map((child) => (
        <CategoryItem key={child.id} cat={child} depth={depth + 1} onNavigate={onNavigate} />
      ))}
    </>
  );
}

export function CategorySidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  // If the tree is a single wrapping root (e.g. "Home & Cooking"), surface its
  // subcategories directly so the full category list is visible instead of one
  // parent row.
  const displayCategories =
    categories.length === 1 && (categories[0].children?.length || 0) > 0
      ? categories[0].children!
      : categories;

  return (
    <>
      <button
        className="hidden items-center gap-2 rounded-lg border-none bg-inverse px-4 py-2 text-sm font-semibold text-inverse-fg max-lg:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        onClick={() => setMobileOpen(true)}
        aria-label="Open categories"
      >
        <Menu size={20} />
        <span>Categories</span>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[999] hidden bg-black/40 max-lg:block" onClick={closeMobile} />
      )}

      <aside
        className={clsx(
          "h-fit w-60 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-surface",
          "max-lg:fixed max-lg:top-0 max-lg:z-[1000] max-lg:h-screen max-lg:w-[280px] max-lg:overflow-y-auto max-lg:rounded-none max-lg:border-none max-lg:transition-[left] max-lg:duration-[250ms] max-lg:ease-out",
          mobileOpen ? "max-lg:left-0" : "max-lg:-left-[300px]",
        )}
      >
        <div className="flex items-center justify-between bg-inverse px-4 py-3 text-inverse-fg">
          <h3 className="m-0 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <Menu size={16} />
            Catalog
          </h3>
          <button
            className="hidden cursor-pointer border-none bg-transparent p-0.5 text-inverse-fg max-lg:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            onClick={closeMobile}
            aria-label="Close categories"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex max-h-[78vh] flex-col overflow-y-auto">
          {categories.length === 0 ? (
            <div className="flex flex-col gap-0">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-line px-3 py-2.5 last:border-b-0">
                  <div className="animate-shimmer h-3 rounded-[6px]" style={{ width: `${55 + (i * 17) % 35}%`, flexShrink: 0 }} />
                  <div className="animate-shimmer h-3 rounded-[6px]" style={{ width: "24px", marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ) : (
            displayCategories.map((cat) => (
              <CategoryItem key={cat.id} cat={cat} onNavigate={closeMobile} />
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

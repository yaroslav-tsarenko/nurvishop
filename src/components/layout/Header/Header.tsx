"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import clsx from "clsx";
import {
  ShoppingCart, Search, Menu, X, User, Shield,
  ChevronRight, Heart, ChevronDown,
  Sofa, BedDouble, CookingPot, Bath, Lamp, Armchair,
  Package, Flower2, Shirt, UtensilsCrossed, LayoutGrid,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { NurviLogo } from "../NurviLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Category[];
}

function subtreeCount(cat: Category): number {
  const own = cat._count?.products || 0;
  return own + (cat.children || []).reduce((s, c) => s + subtreeCount(c), 0);
}

const ICON_MAP: Record<string, React.ElementType> = {
  "living": Sofa,
  "sofa": Sofa,
  "couch": Sofa,
  "chair": Armchair,
  "seating": Armchair,
  "furniture": Armchair,
  "bed": BedDouble,
  "bedroom": BedDouble,
  "sleep": BedDouble,
  "kitchen": CookingPot,
  "cook": CookingPot,
  "cooking": CookingPot,
  "dining": UtensilsCrossed,
  "tableware": UtensilsCrossed,
  "cutlery": UtensilsCrossed,
  "glass": UtensilsCrossed,
  "bath": Bath,
  "bathroom": Bath,
  "towel": Bath,
  "light": Lamp,
  "lighting": Lamp,
  "lamp": Lamp,
  "decor": Flower2,
  "decoration": Flower2,
  "vase": Flower2,
  "candle": Flower2,
  "textile": Shirt,
  "linen": Shirt,
  "cushion": Shirt,
  "blanket": Shirt,
  "storage": Package,
  "organiz": Package,
  "basket": Package,
  "box": Package,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  for (const [keyword, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return Icon;
  }
  return LayoutGrid;
}

const UTILITY_MESSAGES = [
  "Thoughtfully made for a softer home",
  "Natural materials — linen, clay & oak",
  "Warm support · 30-day easy returns",
];

const iconButton =
  "relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted no-underline transition-colors duration-150 hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

const navLink =
  "flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border-none bg-transparent px-2.5 py-1.5 text-[0.8125rem] font-medium text-muted transition-colors duration-150 hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

const drawerNavLink =
  "flex items-center justify-between rounded-md p-3 text-[0.9375rem] font-medium text-ink no-underline transition-colors duration-150 hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

export function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { itemCount, cartBounce } = useCart();
  const { user, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [msgIndex, setMsgIndex] = useState(0);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % UTILITY_MESSAGES.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const unwrapped =
          data.length === 1 &&
          (data[0]?._count?.products || 0) === 0 &&
          (data[0]?.children?.length || 0) > 0
            ? data[0].children
            : data;
        setCategories(unwrapped);
      })
      .catch(() => {});
  }, []);

  const openMega = useCallback(() => {
    clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 200);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Utility strip */}
        <div
          className={clsx(
            "overflow-hidden border-b border-inverse-border bg-inverse text-inverse-fg transition-[max-height,opacity] duration-300",
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
          )}
        >
          <div className="mx-auto flex h-9 max-w-container items-center justify-center px-4 lg:px-6">
            <p className="truncate text-center text-[0.72rem] font-medium tracking-[0.08em] text-inverse-fg">
              {UTILITY_MESSAGES[msgIndex]}
            </p>
          </div>
        </div>

        {/* Main bar */}
        <div
          className={clsx(
            "border-b border-line bg-surface/85 backdrop-blur-md transition-shadow duration-200",
            scrolled && "shadow-md",
          )}
        >
          <div
            className={clsx(
              "mx-auto flex max-w-container items-center gap-6 px-4 transition-[height] duration-200 lg:px-6",
              scrolled ? "h-[62px]" : "h-[72px]",
            )}
          >
            <Link
              href="/"
              className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap font-display text-[1.6rem] font-semibold tracking-[-0.02em] text-ink no-underline"
            >
              <NurviLogo size={26} />
              <span className="font-display font-semibold text-ink">nurvishop</span>
            </Link>

            <nav className="hidden flex-shrink-0 items-center gap-0.5 lg:flex">
              <Link href="/" className={navLink}>
                {t("home")}
              </Link>

              <div
                className="relative"
                ref={megaRef}
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <button className={navLink} onClick={() => setMegaOpen(!megaOpen)}>
                  Shop by room
                  <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: megaOpen ? "rotate(180deg)" : undefined }} />
                </button>
              </div>

              <Link href="/contact" className={navLink}>
                {t("contact")}
              </Link>
            </nav>

            <form
              className="relative hidden h-[42px] max-w-[500px] flex-1 items-center overflow-hidden rounded-pill border border-line bg-mist transition-shadow focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 md:flex"
              onSubmit={handleSearch}
            >
              <Search size={16} className="pointer-events-none absolute left-4 text-subtle" />
              <input
                type="text"
                className="h-full flex-1 border-none bg-transparent py-0 pl-10 pr-3 text-[0.8125rem] text-ink outline-none placeholder:text-subtle"
                placeholder="Search sofas, ceramics, linen…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="h-full cursor-pointer whitespace-nowrap border-none bg-accent px-5 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Search
              </button>
            </form>

            <div className="ml-auto flex flex-shrink-0 items-center gap-0.5">
              <CurrencySwitcher />
              <ThemeToggle />
              <span className="mx-1 hidden h-5 w-px bg-line sm:block" />

              <Link href="/search" className={clsx(iconButton, "flex md:hidden")} aria-label={t("search")}>
                <Search size={20} />
              </Link>

              {user && (
                <Link href="/account/wishlist" className={iconButton} aria-label="Wishlist">
                  <Heart size={20} />
                </Link>
              )}

              <Link href="/cart" className={clsx(iconButton, "relative text-accent hover:text-accent-hover")} aria-label={t("cart")}>
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    key={cartBounce}
                    className="absolute -right-[3px] -top-[3px] flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-pill border-2 border-surface bg-accent px-1 text-[0.625rem] font-bold text-white"
                    initial={cartBounce > 0 ? { scale: 0.5 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10, stiffness: 400 }}
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </Link>

              {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                <a href="/admin" className={iconButton} aria-label="Admin">
                  <Shield size={20} />
                </a>
              )}

              {user ? (
                <Link href="/account" className={iconButton} aria-label={t("account")}>
                  <User size={20} />
                </Link>
              ) : (
                <Link href="/auth/login" className={iconButton} aria-label={t("login")}>
                  <User size={20} />
                </Link>
              )}

              <button
                className={clsx(iconButton, "flex lg:hidden")}
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mega Menu - full width, outside header */}
      <AnimatePresence>
        {megaOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/45"
              style={{ top: scrolled ? 62 : 108 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMegaOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 z-[45] max-h-[36vh] overflow-y-auto border-b border-line bg-surface shadow-lg"
              style={{ top: scrolled ? 62 : 108 }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <div className="mx-auto max-w-container px-6 pb-4 pt-5">
                <p className="eyebrow mb-3">Shop by room</p>
                {categories.length === 0 ? (
                  <div className="grid grid-cols-3 gap-2 min-[1201px]:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-md px-3 py-2.5">
                        <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-md bg-well" />
                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="h-2.5 animate-pulse rounded-sm bg-well" style={{ width: `${55 + (i * 17) % 35}%` }} />
                          <div className="h-2.5 animate-pulse rounded-sm bg-well" style={{ width: "40%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="grid grid-cols-3 gap-2 min-[1201px]:grid-cols-5">
                  {[...categories]
                    .sort((a, b) => subtreeCount(b) - subtreeCount(a))
                    .slice(0, 10)
                    .map((cat) => {
                      const Icon = getIconForCategory(cat.name);
                      const count = subtreeCount(cat);
                      return (
                        <Link
                          key={cat.id}
                          href={`/catalog/${cat.slug}`}
                          className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-ink no-underline transition-colors duration-150 hover:bg-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                          onClick={() => setMegaOpen(false)}
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent-light text-accent transition-colors duration-150 group-hover:bg-accent group-hover:text-white">
                            <Icon size={20} />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8rem] font-semibold leading-tight">{cat.name}</span>
                            <span className="text-[0.675rem] text-subtle">{count} products</span>
                          </div>
                          <ChevronRight size={14} className="ml-auto flex-shrink-0 text-subtle opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                      );
                    })}
                </div>
                )}
                <div className="mt-3 flex items-center border-t border-line pt-2.5">
                  <Link
                    href="/catalog"
                    className="flex items-center gap-1 text-[0.8125rem] font-semibold text-accent no-underline transition-[gap] duration-150 hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    onClick={() => setMegaOpen(false)}
                  >
                    Browse all categories <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-[100] flex w-[min(85vw,380px)] flex-col rounded-l-2xl bg-surface shadow-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="font-display text-[1.25rem] font-semibold text-ink">Menu</span>
                <button
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted hover:bg-mist hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <nav className="flex flex-col gap-1">
                  <Link href="/" className={drawerNavLink} onClick={() => setMobileOpen(false)}>
                    {t("home")} <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog" className={drawerNavLink} onClick={() => setMobileOpen(false)}>
                    {t("catalog")} <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog?sort=newest" className={drawerNavLink} onClick={() => setMobileOpen(false)}>
                    New Arrivals <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog?onSale=true" className={drawerNavLink} onClick={() => setMobileOpen(false)}>
                    Deals <ChevronRight size={18} />
                  </Link>

                  {categories.length > 0 && (
                    <details className="group rounded-md">
                      <summary className={clsx(drawerNavLink, "list-none cursor-pointer marker:hidden")}>
                        Shop by room
                        <ChevronDown size={18} className="transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="mt-1 flex flex-col gap-0.5 pl-3">
                        {[...categories]
                          .sort((a, b) => subtreeCount(b) - subtreeCount(a))
                          .slice(0, 8)
                          .map((cat) => {
                            const Icon = getIconForCategory(cat.name);
                            return (
                              <Link
                                key={cat.id}
                                href={`/catalog/${cat.slug}`}
                                className="flex items-center gap-3 rounded-md p-2.5 text-[0.875rem] text-muted no-underline transition-colors duration-150 hover:bg-mist hover:text-ink"
                                onClick={() => setMobileOpen(false)}
                              >
                                <Icon size={18} className="flex-shrink-0 text-accent" />
                                <span className="truncate">{cat.name}</span>
                              </Link>
                            );
                          })}
                      </div>
                    </details>
                  )}

                  <div className="my-2 h-px bg-line" />

                  <Link href="/contact" className={drawerNavLink} onClick={() => setMobileOpen(false)}>
                    {t("contact")} <ChevronRight size={18} />
                  </Link>
                  {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <a href="/admin" className={drawerNavLink} onClick={() => setMobileOpen(false)}>
                      Admin Panel <ChevronRight size={18} />
                    </a>
                  )}
                </nav>
              </div>

              <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
                {user ? (
                  <Link href="/account" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center justify-center rounded-md bg-accent p-3 text-sm font-semibold text-white">
                      My Account
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center justify-center rounded-md bg-accent p-3 text-sm font-semibold text-white">
                        Sign In
                      </div>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <div className="flex items-center justify-center rounded-md bg-mist p-3 text-sm font-semibold text-ink">
                        Create Account
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

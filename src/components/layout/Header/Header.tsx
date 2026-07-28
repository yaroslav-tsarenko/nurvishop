"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  ShoppingCart, Search, Menu, X, User, Shield,
  ChevronRight, Heart, ChevronDown,
  Cable, LayoutGrid, Zap, Lightbulb, CircuitBoard, Plug,
  Box, Wrench, Shield as ShieldIcon, SquareStack,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { NurviLogo } from "../NurviLogo";
import { CurrencySwitcher } from "./CurrencySwitcher";
import styles from "./Header.module.css";

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
  "wiring": Cable,
  "cable": Cable,
  "automation": CircuitBoard,
  "control": CircuitBoard,
  "distribution": LayoutGrid,
  "energy": Zap,
  "protection": ShieldIcon,
  "protective": ShieldIcon,
  "fuse": Zap,
  "lighting": Lightbulb,
  "light": Lightbulb,
  "terminal": SquareStack,
  "mounting": Box,
  "box": Box,
  "conduit": Wrench,
  "connector": Plug,
  "power": Zap,
  "plug": Plug,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  for (const [keyword, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return Icon;
  }
  return LayoutGrid;
}

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
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
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
      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <NurviLogo size={26} />
            <span className={styles.logoText}>nurvishop</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              {t("home")}
            </Link>

            <div
              className={styles.navItem}
              ref={megaRef}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <button className={styles.navLink} onClick={() => setMegaOpen(!megaOpen)}>
                {t("catalog")}
                <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: megaOpen ? "rotate(180deg)" : undefined }} />
              </button>
            </div>

            <Link href="/contact" className={styles.navLink}>
              {t("contact")}
            </Link>
          </nav>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchBtn}>
              Search
            </button>
          </form>

          <div className={styles.actions}>
            <Link href="/search" className={`${styles.iconButton} ${styles.mobileSearchBtn}`} aria-label={t("search")}>
              <Search size={20} />
            </Link>

            <ThemeToggle />
            <CurrencySwitcher />

            {user && (
              <Link href="/account/wishlist" className={styles.iconButton} aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            )}

            <Link href="/cart" className={`${styles.iconButton} ${styles.cartButton}`} aria-label={t("cart")}>
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <motion.span
                  key={cartBounce}
                  className={styles.cartBadge}
                  initial={cartBounce > 0 ? { scale: 0.5 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 400 }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </Link>

            {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
              <a href="/admin" className={styles.iconButton} aria-label="Admin">
                <Shield size={20} />
              </a>
            )}

            {user ? (
              <Link href="/account" className={styles.iconButton} aria-label={t("account")}>
                <User size={20} />
              </Link>
            ) : (
              <Link href="/auth/login" className={styles.iconButton} aria-label={t("login")}>
                <User size={20} />
              </Link>
            )}

            <button
              className={`${styles.iconButton} ${styles.mobileMenuButton}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mega Menu - full width, outside header */}
      <AnimatePresence>
        {megaOpen && (
          <>
            <motion.div
              className={styles.megaOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMegaOpen(false)}
            />
            <motion.div
              className={styles.megaMenu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
            >
              <div className={styles.megaInner}>
                {categories.length === 0 ? (
                  <div className={styles.megaSkeleton}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={styles.megaSkeletonCard}>
                        <div className={styles.megaSkeletonIcon} />
                        <div className={styles.megaSkeletonText}>
                          <div className={styles.megaSkeletonBar} style={{ width: `${55 + (i * 17) % 35}%` }} />
                          <div className={styles.megaSkeletonBar} style={{ width: "40%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className={styles.megaGrid}>
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
                          className={styles.megaCard}
                          onClick={() => setMegaOpen(false)}
                        >
                          <div className={styles.megaCardIcon}>
                            <Icon size={20} />
                          </div>
                          <div className={styles.megaCardText}>
                            <span className={styles.megaCardName}>{cat.name}</span>
                            <span className={styles.megaCardCount}>{count} products</span>
                          </div>
                          <ChevronRight size={14} className={styles.megaCardArrow} />
                        </Link>
                      );
                    })}
                </div>
                )}
                <div className={styles.megaFooter}>
                  <Link
                    href="/catalog"
                    className={styles.megaFooterLink}
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
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileDrawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className={styles.drawerHeader}>
                <span className={styles.drawerTitle}>Menu</span>
                <button className={styles.drawerClose} onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.drawerBody}>
                <nav className={styles.drawerNav}>
                  <Link href="/" className={styles.drawerNavLink} onClick={() => setMobileOpen(false)}>
                    {t("home")} <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog" className={styles.drawerNavLink} onClick={() => setMobileOpen(false)}>
                    {t("catalog")} <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog?sort=newest" className={styles.drawerNavLink} onClick={() => setMobileOpen(false)}>
                    New Arrivals <ChevronRight size={18} />
                  </Link>
                  <Link href="/catalog?onSale=true" className={styles.drawerNavLink} onClick={() => setMobileOpen(false)}>
                    Deals <ChevronRight size={18} />
                  </Link>

                  <div className={styles.drawerDivider} />

                  <Link href="/contact" className={styles.drawerNavLink} onClick={() => setMobileOpen(false)}>
                    {t("contact")} <ChevronRight size={18} />
                  </Link>
                  {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <a href="/admin" className={styles.drawerNavLink} onClick={() => setMobileOpen(false)}>
                      Admin Panel <ChevronRight size={18} />
                    </a>
                  )}
                </nav>
              </div>

              <div className={styles.drawerFooter}>
                {user ? (
                  <Link href="/account" onClick={() => setMobileOpen(false)}>
                    <div className={`${styles.drawerBtn} ${styles.drawerBtnPrimary}`}>
                      My Account
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <div className={`${styles.drawerBtn} ${styles.drawerBtnPrimary}`}>
                        Sign In
                      </div>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <div className={`${styles.drawerBtn} ${styles.drawerBtnSecondary}`}>
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

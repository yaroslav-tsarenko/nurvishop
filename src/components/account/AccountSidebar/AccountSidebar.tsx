"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useAuth } from "@/providers/AuthProvider";
import { LayoutDashboard, Package, User, MapPin, Heart, LogOut } from "lucide-react";

const navItems = [
  { href: "/account", icon: <LayoutDashboard size={18} />, labelKey: "title" as const },
  { href: "/account/orders", icon: <Package size={18} />, labelKey: "orders" as const },
  { href: "/account/profile", icon: <User size={18} />, labelKey: "profile" as const },
  { href: "/account/addresses", icon: <MapPin size={18} />, labelKey: "addresses" as const },
  { href: "/account/wishlist", icon: <Heart size={18} />, labelKey: "wishlist" as const },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const t = useTranslations("account");
  const { user, signOut } = useAuth();

  return (
    <aside className="sticky top-8 flex h-fit w-60 flex-col rounded-lg border border-line bg-mist py-6 max-md:static max-md:w-full max-md:py-4">
      <div className="mb-3 flex items-center gap-3 border-b border-line px-5 pb-5 max-md:mb-2 max-md:px-4 max-md:pb-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-base font-bold text-white">
          {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{user?.name || "User"}</p>
          <p className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-subtle">
            {user?.email}
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 px-3 max-md:flex-row max-md:gap-1.5 max-md:overflow-x-auto max-md:px-3 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const isActive =
            pathname.endsWith(item.href) ||
            (item.href !== "/account" && pathname.includes(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted no-underline transition-colors duration-200 hover:bg-well hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 max-md:flex-none max-md:whitespace-nowrap max-md:px-3.5 max-md:py-2 max-md:text-[0.8125rem]",
                isActive && "bg-well font-semibold text-ink"
              )}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          );
        })}
        <button
          className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-danger transition-colors duration-200 hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 max-md:mt-0 max-md:flex-none max-md:whitespace-nowrap max-md:px-3.5 max-md:py-2 max-md:text-[0.8125rem]"
          onClick={signOut}
        >
          <LogOut size={18} />
          {t("logout")}
        </button>
      </nav>
    </aside>
  );
}

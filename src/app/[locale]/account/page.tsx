"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Chip } from "@heroui/react";
import { Package, MapPin, Heart, User as UserIcon, ChevronRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

const statusColors: Record<string, "default" | "accent" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  PROCESSING: "accent",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

export default function AccountPage() {
  const t = useTranslations("account");
  const { user, loading } = useAuth();
  const { currency, convert } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data.data) ? data.data : []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.25rem" }}>
        {t("title")}
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
        {t("welcome", { name: user?.name || user?.email || "" })}
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle">Orders</span>
          <span className="text-2xl font-extrabold tracking-tight">{orders.length}</span>
          <span className="text-xs text-muted">All-time</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle">Total Spent</span>
          <span className="text-2xl font-extrabold tracking-tight">{formatPrice(convert(totalSpent), currency)}</span>
          <span className="text-xs text-muted">Across all orders</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-subtle">Account</span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-extrabold tracking-tight">{user?.email}</span>
          <span className="text-xs text-muted">{user?.name || "No name set"}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[2fr_1fr] gap-6 max-[768px]:grid-cols-1">
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 700 }}>Recent Orders</h2>
            <Link href="/account/orders" style={{ fontSize: "0.8125rem", color: "var(--color-accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              View all <ChevronRight size={14} />
            </Link>
          </div>
          {ordersLoading ? (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--color-text-tertiary)" }}>Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-lg)", color: "var(--color-text-tertiary)" }}>
              <Package size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
              <p style={{ fontSize: "0.875rem" }}>No orders yet</p>
              <Link href="/catalog" style={{ display: "inline-block", marginTop: "0.75rem", color: "var(--color-accent)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/account/orders/${order.id}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-6 rounded-lg border border-line bg-surface px-6 py-4 text-ink no-underline transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-accent max-[640px]:grid-cols-[1fr_auto] max-[640px]:grid-rows-[auto_auto] max-[640px]:gap-x-4 max-[640px]:gap-y-2 max-[640px]:px-4 max-[640px]:py-3.5">
                  <div className="min-w-0 max-[640px]:col-span-full">
                    <div className="text-[0.9375rem] font-bold">#{order.orderNumber.slice(-8)}</div>
                    <div className="mt-0.5 text-xs text-subtle">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <Chip size="sm" color={statusColors[order.status] || "default"}>{order.status}</Chip>
                  <span className="whitespace-nowrap text-[0.9375rem] font-bold max-[640px]:text-base">{formatPrice(convert(Number(order.total)), currency)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.75rem" }}>Quick Links</h2>
          <Link href="/account/orders" className="flex items-center gap-3 rounded-md px-2 py-3 text-sm text-ink no-underline transition-colors hover:bg-mist">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-accent-light text-accent"><Package size={16} /></span>
            <span style={{ flex: 1 }}>{t("orders")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
          <Link href="/account/profile" className="flex items-center gap-3 rounded-md px-2 py-3 text-sm text-ink no-underline transition-colors hover:bg-mist">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-accent-light text-accent"><UserIcon size={16} /></span>
            <span style={{ flex: 1 }}>{t("profile")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
          <Link href="/account/addresses" className="flex items-center gap-3 rounded-md px-2 py-3 text-sm text-ink no-underline transition-colors hover:bg-mist">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-accent-light text-accent"><MapPin size={16} /></span>
            <span style={{ flex: 1 }}>{t("addresses")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
          <Link href="/account/wishlist" className="flex items-center gap-3 rounded-md px-2 py-3 text-sm text-ink no-underline transition-colors hover:bg-mist">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-accent-light text-accent"><Heart size={16} /></span>
            <span style={{ flex: 1 }}>{t("wishlist")}</span>
            <ChevronRight size={16} color="var(--color-text-tertiary)" />
          </Link>
        </div>
      </div>
    </div>
  );
}

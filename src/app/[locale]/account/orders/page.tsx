"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Chip } from "@heroui/react";
import { useAuth } from "@/providers/AuthProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";
import { Package } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: string }[];
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

export default function OrdersPage() {
  const t = useTranslations("account");
  const nav = useTranslations("nav");
  const { user } = useAuth();
  const { currency, convert } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data.data) ? data.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem" }}>{t("orders")}</h1>

      {orders.length === 0 ? (
        <EmptyState
          title={t("noOrders")}
          subtitle={t("noOrdersSubtitle")}
          actionLabel={nav("catalog")}
          actionHref="/catalog"
          icon={<Package size={48} />}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-6 rounded-lg border border-line bg-surface px-6 py-4 text-ink no-underline transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-accent max-[640px]:grid-cols-[1fr_auto] max-[640px]:grid-rows-[auto_auto] max-[640px]:gap-x-4 max-[640px]:gap-y-2 max-[640px]:px-4 max-[640px]:py-3.5">
              <div className="min-w-0 max-[640px]:col-span-full">
                <div className="text-[0.9375rem] font-bold">#{order.orderNumber.slice(-8)}</div>
                <div className="mt-0.5 text-xs text-subtle">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                <div className="mt-1 text-xs text-subtle">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </div>
              </div>
              <Chip size="sm" color={statusColors[order.status] || "default"}>{order.status}</Chip>
              <span className="whitespace-nowrap text-[0.9375rem] font-bold max-[640px]:text-base">{formatPrice(convert(Number(order.total)), currency)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

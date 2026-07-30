"use client";

import { useEffect, useState, use } from "react";
import { useTranslations } from "next-intl";
import { Chip } from "@heroui/react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner/LoadingSpinner";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils/format-price";
import { format } from "date-fns";
import type { OrderDetail } from "@/types/order";

const statusColors: Record<string, "default" | "accent" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  PROCESSING: "accent",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("account");
  const { currency, convert } = useCurrency();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return <div style={{ padding: "2rem", textAlign: "center" }}>Order not found</div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            {t("orderNumber", { number: order.orderNumber.slice(-8) })}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
            Placed on {format(new Date(order.createdAt), "MMM d, yyyy 'at' HH:mm")}
          </p>
        </div>
        <Chip size="lg" color={statusColors[order.status] || "default"}>{order.status}</Chip>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
        <div className="rounded-lg border border-line bg-surface px-5 py-4">
          <div className="mb-2 text-[0.8125rem] font-bold uppercase tracking-wide text-subtle">Shipping Address</div>
          <div className="text-sm leading-[1.5] text-muted">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
            {order.shippingAddress.address1}<br />
            {order.shippingAddress.address2 && <>{order.shippingAddress.address2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface px-5 py-4">
          <div className="mb-2 text-[0.8125rem] font-bold uppercase tracking-wide text-subtle">Order Info</div>
          <div className="text-sm leading-[1.5] text-muted">
            Payment: <strong>{order.paymentStatus}</strong>
            {order.paymentMethod && <><br />Method: {order.paymentMethod}</>}
            {order.shippingMethod && <><br />Shipping: {order.shippingMethod}</>}
            {order.trackingNumber && <><br />Tracking: <strong>{order.trackingNumber}</strong></>}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse max-[640px]:hidden [&_td]:border-b [&_td]:border-line [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-sm [&_th]:border-b [&_th]:border-line [&_th]:bg-mist [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-subtle [&_tr:last-child_td]:border-b-0">
          <thead>
            <tr>
              <th>Product</th>
              <th style={{ textAlign: "right" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Price</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  {item.variantName && <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{item.variantName}</div>}
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>SKU: {item.productSku}</div>
                </td>
                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>{formatPrice(convert(Number(item.price)), currency)}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>{formatPrice(convert(Number(item.total)), currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="hidden flex-col max-[640px]:flex">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 border-b border-line px-4 py-3.5 last:border-b-0">
              <div className="text-sm font-semibold">{item.productName}</div>
              {item.variantName && <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{item.variantName}</div>}
              <div className="flex justify-between text-xs text-subtle">
                <span>Qty {item.quantity} × {formatPrice(convert(Number(item.price)), currency)}</span>
                <span className="font-bold text-ink">{formatPrice(convert(Number(item.total)), currency)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end gap-1 border-t border-line bg-mist px-5 py-4 text-sm">
          <div className="flex gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
            <span>{formatPrice(convert(Number(order.subtotal)), currency)}</span>
          </div>
          <div className="flex gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
            <span>{Number(order.shippingCost) === 0 ? "Free" : formatPrice(convert(Number(order.shippingCost)), currency)}</span>
          </div>
          <div className="flex gap-4">
            <span style={{ color: "var(--color-text-secondary)" }}>Tax</span>
            <span>{formatPrice(convert(Number(order.taxAmount)), currency)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex gap-4">
              <span style={{ color: "var(--color-success)" }}>Discount</span>
              <span style={{ color: "var(--color-success)" }}>−{formatPrice(convert(Number(order.discountAmount)), currency)}</span>
            </div>
          )}
          <div className="flex w-full justify-between gap-4 border-t border-line pt-2 mt-1 text-lg font-extrabold">
            <span>Total</span>
            <span>{formatPrice(convert(Number(order.total)), currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

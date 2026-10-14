import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { FaqItem } from "./FaqItem";

// Question/answer copy lives in messages under faq.items.<key>.{q,a}.
const FAQ_KEYS = [
  "shippingTime",
  "returns",
  "international",
  "tracking",
  "payment",
  "changeOrder",
  "giftWrap",
  "support",
] as const;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faq" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 1rem 4rem" }}>
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: t("breadcrumb") }]} />

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "0.75rem", wordBreak: "break-word" }}>
            {t.rich("title", {
              highlight: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </h1>
          <p style={{ fontSize: "clamp(0.875rem, 2.4vw, 1rem)", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            {t("subtitle")}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {FAQ_KEYS.map((key) => (
            <FaqItem key={key} q={t(`items.${key}.q`)} a={t(`items.${key}.a`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

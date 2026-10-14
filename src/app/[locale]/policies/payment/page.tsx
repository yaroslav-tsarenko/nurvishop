import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PolicyLayout } from "@/components/layout/PolicyLayout/PolicyLayout";
import { getPolicy } from "@/lib/policies-content.lv";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "policies" });
  return { title: t("pageMetaTitle", { title: getPolicy("payment", locale).title }) };
}

export default async function Policy_payment_Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const policy = getPolicy("payment", locale);
  return (
    <PolicyLayout locale={locale} title={policy.title} lastUpdated={policy.lastUpdated}>
      <div dangerouslySetInnerHTML={{ __html: policy.html }} />
    </PolicyLayout>
  );
}

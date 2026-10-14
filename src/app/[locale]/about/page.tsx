import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { Heart, Truck, Shield, Award } from "lucide-react";

// Copy lives in messages under about.values.<key>.{title,desc}.
const values = [
  { key: "customerFirst", icon: <Heart size={28} /> },
  { key: "fastReliable", icon: <Truck size={28} /> },
  { key: "certifiedQuality", icon: <Shield size={28} /> },
  { key: "tradePricing", icon: <Award size={28} /> },
] as const;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div className="mx-auto max-w-container px-4 pb-16">
      <Breadcrumbs items={[{ label: nav("home"), href: "/" }, { label: t("breadcrumb") }]} />

      <div className="mx-auto max-w-[720px]">
        <div className="mb-12 text-center max-[640px]:mb-8">
          <h1 className="mb-4 font-display text-4xl font-extrabold tracking-tight max-[640px]:text-[1.625rem]">
            {t.rich("title", {
              brand: (chunks) => <span className="gradient-text">{chunks}</span>,
            })}
          </h1>
          <p className="mx-auto max-w-[540px] text-[1.0625rem] leading-[1.7] text-muted max-[640px]:text-[0.9375rem]">
            {t("intro")}
          </p>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-5 max-[600px]:mb-8 max-[600px]:grid-cols-1 max-[600px]:gap-3.5">
          {values.map((v) => (
            <div key={v.key} className="rounded-xl border border-line bg-surface p-7 max-[480px]:p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-light text-accent">{v.icon}</div>
              <h3 className="mb-2 text-[1.0625rem] font-bold">{t(`values.${v.key}.title`)}</h3>
              <p className="text-sm leading-[1.6] text-muted">{t(`values.${v.key}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-accent p-10 text-center text-white max-[480px]:px-5 max-[480px]:py-7">
          <h2 className="mb-3 text-2xl font-extrabold max-[480px]:text-xl">{t("promiseTitle")}</h2>
          <p className="mx-auto max-w-[480px] text-[0.9375rem] leading-[1.7] opacity-90">
            {t("promiseText")}
          </p>
        </div>
      </div>
    </div>
  );
}

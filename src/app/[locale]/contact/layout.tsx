import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates, openGraphFor, twitterFor } from "@/lib/i18n/metadata";

// The contact page is a client component, so its translated metadata lives here.
interface ContactLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: localeAlternates(locale, "/contact"),
    openGraph: openGraphFor(locale, { title, description, path: "/contact" }),
    twitter: twitterFor({ title, description }),
  };
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return children;
}

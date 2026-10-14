import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  // One entry per locale, each listing every language version as an hreflang
  // alternate so search engines pair /en/x with /lv/x.
  const localized = (
    path: string,
    lastModified: Date,
    changeFrequency: ChangeFrequency,
    priority: number,
  ): MetadataRoute.Sitemap => {
    const languages = Object.fromEntries(
      routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
    );
    return routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  };

  const now = new Date();
  const staticPages = [
    ...localized("", now, "daily", 1),
    ...localized("/catalog", now, "daily", 0.9),
    ...localized("/contact", now, "monthly", 0.5),
    ...localized("/policies/privacy", now, "monthly", 0.3),
    ...localized("/policies/terms", now, "monthly", 0.3),
    ...localized("/policies/returns", now, "monthly", 0.3),
  ];

  const productPages = products.flatMap((product) =>
    localized(`/product/${product.slug}`, product.updatedAt, "weekly", 0.8),
  );

  const categoryPages = categories.flatMap((category) =>
    localized(`/catalog/${category.slug}`, category.updatedAt, "weekly", 0.7),
  );

  return [...staticPages, ...productPages, ...categoryPages];
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductGallery } from "@/components/product/ProductGallery/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo/ProductInfo";
import { ProductTabs } from "@/components/product/ProductTabs/ProductTabs";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizeCategoryName } from "@/lib/i18n/category-names";
import { localizeProduct } from "@/lib/i18n/product";
import { localeAlternates, openGraphFor, twitterFor } from "@/lib/i18n/metadata";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getCategoryChain(categoryId: string): Promise<{ name: string; slug: string }[]> {
  const chain: { name: string; slug: string }[] = [];
  let currentId: string | null = categoryId;

  while (currentId) {
    const cat: { name: string; slug: string; parentId: string | null } | null =
      await prisma.category.findUnique({
        where: { id: currentId },
        select: { name: true, slug: true, parentId: true },
      });
    if (!cat) break;
    chain.unshift({ name: cat.name, slug: cat.slug });
    currentId = cat.parentId;
  }

  return chain;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const raw = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      shortDescription: true,
      translations: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
    },
  });

  if (!raw) return {};
  const product = localizeProduct(raw, locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  const title = product.metaTitle || product.name;
  const description =
    product.metaDescription ||
    product.shortDescription ||
    t("productDescriptionFallback", { name: product.name });
  const path = `/product/${slug}`;
  const images = product.images.map((img) => ({ url: img.url, alt: img.alt || product.name }));

  return {
    title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, { title, description, path, images }),
    twitter: twitterFor({ title, description, images }),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations({ locale, namespace: "nav" });

  const rawProduct = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
      variants: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!rawProduct || rawProduct.status === "ARCHIVED") notFound();
  const product = localizeProduct(rawProduct, locale);

  const primaryCategory = product.categories[0]?.category;
  const categoryChain = (primaryCategory
    ? await getCategoryChain(primaryCategory.id)
    : []
  ).map((cat) => ({ ...cat, name: localizeCategoryName(cat.name, locale) }));

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0
    ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
    : 0;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  const characteristics = product.characteristics as Record<string, Record<string, string>> | null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || product.name,
    sku: product.sku,
    gtin13: product.ean || product.gtin || undefined,
    image: product.images[0]?.url,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "EUR",
      availability: product.quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/${locale}/product/${product.slug}`,
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount,
      },
    }),
  };

  const breadcrumbItems = [
    { label: nav("home"), href: "/" },
    { label: nav("catalog"), href: "/catalog" },
    ...categoryChain.map((cat) => ({
      label: cat.name,
      href: `/catalog/${cat.slug}`,
    })),
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-container px-4 pb-16">
      <JsonLd data={jsonLd} />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-2 grid grid-cols-2 items-start gap-12 max-[1024px]:gap-8 max-[768px]:grid-cols-1 max-[768px]:gap-6">
        <div className="sticky top-[calc(var(--header-height)+1rem)] max-[768px]:static">
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <ProductInfo
          id={product.id}
          name={product.name}
          slug={product.slug}
          sku={product.sku}
          price={Number(product.price)}
          comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
          quantity={product.quantity}
          shortDescription={product.shortDescription}
          description={product.description}
          brand={product.brand}
          condition={product.condition}
          lowStockAlert={product.lowStockAlert}
          imageUrl={product.images[0]?.url}
          ean={product.ean}
          reviewCount={reviewCount}
          avgRating={avgRating}
          categoryPath={categoryChain}
        />
      </div>

      <ProductTabs
        description={product.description}
        characteristics={characteristics}
        reviews={product.reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}

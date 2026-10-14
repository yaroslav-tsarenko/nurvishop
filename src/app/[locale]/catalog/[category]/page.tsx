import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { localizeCategoryName } from "@/lib/i18n/category-names";
import { localizedProductName } from "@/lib/i18n/product";
import { localeAlternates, openGraphFor, twitterFor } from "@/lib/i18n/metadata";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ category: string; locale: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug, locale } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, description: true, imageUrl: true },
  });
  if (!category) return {};

  const name = localizeCategoryName(category.name, locale);
  const scope = {
    status: "ACTIVE" as const,
    categories: {
      some: {
        category: {
          OR: [
            { id: category.id },
            { parentId: category.id },
            { parent: { parentId: category.id } },
          ],
        },
      },
    },
  };
  // Link previews (Telegram, WhatsApp, Facebook) show og:image — use the
  // category image or a few product photos so shared category links aren't
  // image-less.
  const [count, sample] = await Promise.all([
    prisma.product.count({ where: scope }),
    prisma.product.findMany({
      where: { ...scope, images: { some: {} } },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 4,
      select: { images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } } },
    }),
  ]);

  const t = await getTranslations({ locale, namespace: "meta" });
  const description =
    (locale === "en" && category.description) || t("categoryDescription", { category: name, count });
  const path = `/catalog/${slug}`;
  const images = [
    ...(category.imageUrl ? [category.imageUrl] : []),
    ...sample.map((p) => p.images[0]?.url).filter((u): u is string => !!u),
  ].map((url) => ({ url, alt: name }));

  return {
    title: name,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, { title: name, description, path, images }),
    twitter: twitterFor({ title: name, description, images }),
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug, locale } = await params;
  setRequestLocale(locale);
  const [nav, c] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "catalog" }),
  ]);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        select: {
          id: true,
          children: { select: { id: true } },
        },
      },
    },
  });

  if (!category) notFound();

  const categoryName = localizeCategoryName(category.name, locale);

  const categoryIds = [
    category.id,
    ...category.children.flatMap((c) => [c.id, ...c.children.map((g) => g.id)]),
  ];

  const productCategories = await prisma.productCategory.findMany({
    where: { categoryId: { in: categoryIds } },
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          categories: { include: { category: { select: { name: true } } } },
        },
      },
    },
  });

  const seen = new Set<string>();
  const products = productCategories
    .map((pc) => pc.product)
    .filter((p) => {
      if (p.status !== "ACTIVE" || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .map((p) => ({
      id: p.id,
      name: localizedProductName(p.name, p.translations, locale),
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
      quantity: p.quantity,
      images: p.images.map((img) => ({ url: img.url, alt: img.alt })),
      categories: p.categories.map((pc) => ({
        category: { name: localizeCategoryName(pc.category.name, locale) },
      })),
    }));

  return (
    <div style={{ maxWidth: "var(--max-width)", margin: "0 auto", padding: "0 1rem 3rem", overflowWrap: "anywhere" }}>
      <Breadcrumbs
        items={[
          { label: nav("home"), href: "/" },
          { label: nav("catalog"), href: "/catalog" },
          { label: categoryName },
        ]}
      />

      <h1 style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem", wordBreak: "break-word" }}>
        {categoryName}
      </h1>

      {category.description && (
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          {category.description}
        </p>
      )}

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <EmptyState
          title={c("emptyCategoryTitle")}
          subtitle={c("emptyCategorySubtitle")}
          actionLabel={c("browseAll")}
          actionHref="/catalog"
        />
      )}
    </div>
  );
}

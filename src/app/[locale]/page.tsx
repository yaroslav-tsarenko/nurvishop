import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { MarketplaceHome } from "@/components/home/MarketplaceHome/MarketplaceHome";
import {
  getFeaturedProducts,
  getSaleProducts,
  getNewProducts,
  getPopularProducts,
  getHomepageCategorySections,
  getBrandSections,
  TOP_BRANDS,
} from "@/lib/homepage-products";

export const dynamic = "force-dynamic";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

async function getHomeData() {
  try {
    const productInclude = {
      images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    };

    const [
      heroSlides,
      dealCards,
      promoSmall,
      promoWide,
      brands,
      sections,
      tabs,
      utilityLinks,
      promoStripItems,
      allActiveProducts,
      categoriesWithChildren,
    ] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true, type: "HERO" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "DEAL_CARD" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "PROMO_SMALL" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "PROMO_WIDE" }, orderBy: { sortOrder: "asc" } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.homepageTab.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.utilityLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.promoStripItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: productInclude,
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, slug: true },
          },
          _count: { select: { products: true } },
        },
      }),
    ]);

    const sectionProducts: Record<string, typeof allActiveProducts> = {};
    for (const section of sections) {
      let products = allActiveProducts;
      switch (section.filterType) {
        case "featured":
          products = allActiveProducts.filter((p) => p.isFeatured);
          break;
        case "newest":
          products = [...allActiveProducts].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "onSale":
          products = allActiveProducts.filter((p) => p.comparePrice !== null);
          break;
        case "category":
          if (section.categorySlug) {
            products = allActiveProducts.filter((p) =>
              p.categories.some((c) => c.category.slug === section.categorySlug)
            );
          }
          break;
        case "popular":
          products = [...allActiveProducts].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case "all":
        default:
          break;
      }
      sectionProducts[section.slug] = products.slice(0, section.maxProducts);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = allActiveProducts as any[];

    const featuredProducts = getFeaturedProducts(products, 10);

    // Each homepage block draws from the same product pool, so pick distinct
    // items across sale → popular → new to avoid showing the same product thrice.
    const used = new Set<string>();
    const takeDistinct = (candidates: typeof products, limit: number) => {
      const picked: typeof products = [];
      for (const p of candidates) {
        if (used.has(p.id)) continue;
        used.add(p.id);
        picked.push(p);
        if (picked.length >= limit) break;
      }
      return picked;
    };

    const saleProducts = takeDistinct(getSaleProducts(products, products.length), 15);
    const popularProducts = takeDistinct(getPopularProducts(products, products.length), 10);
    const newProducts = takeDistinct(getNewProducts(products, products.length), 10);

    const categorySections = getHomepageCategorySections(
      products,
      categoriesWithChildren.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        children: c.children,
        _count: c._count,
      })),
      10,
      6,
    );

    const brandSections = getBrandSections(products, TOP_BRANDS, 8);

    // Surface subcategories of a single empty root (e.g. "Home & Cooking")
    // so the showcase highlights real rooms instead of one umbrella category.
    const showcaseSource =
      categoriesWithChildren.length === 1 &&
      categoriesWithChildren[0]._count.products === 0 &&
      categoriesWithChildren[0].children.length > 0
        ? categoriesWithChildren[0].children.map((ch) => ({ id: ch.id, name: ch.name, slug: ch.slug }))
        : categoriesWithChildren.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

    const categoryShowcase = showcaseSource.map((c) => {
      const productCount = products.filter((p: { categories?: { category: { slug: string } }[] }) =>
        p.categories?.some((pc) => pc.category.slug === c.slug)
      ).length;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: null as string | null,
        productCount,
      };
    }).filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 12);

    return serialize({
      heroSlides,
      dealCards,
      promoSmall,
      promoWide,
      brands,
      sections,
      tabs,
      utilityLinks,
      promoStripItems,
      sectionProducts,
      categories: categoriesWithChildren,
      featuredProducts,
      saleProducts,
      newProducts,
      popularProducts,
      categorySections,
      brandSections,
      categoryShowcase,
    });
  } catch (e) {
    console.error("Homepage data fetch error:", e);
    return {
      heroSlides: [], dealCards: [], promoSmall: [], promoWide: [],
      brands: [], sections: [], tabs: [], utilityLinks: [],
      promoStripItems: [], sectionProducts: {}, categories: [],
      featuredProducts: [], saleProducts: [], newProducts: [],
      popularProducts: [], categorySections: [], brandSections: [],
      categoryShowcase: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "nurvishop",
          url: siteUrl,
          description: "Warm, naturally made home goods — linen, clay, oak and stoneware for a softer home.",
        }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <MarketplaceHome data={data as any} />
    </>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { localizeProduct } from "@/lib/i18n/product";
import { findProductIdsByTranslation } from "@/lib/i18n/product-search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const locale = searchParams.get("locale") || "";

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const translatedIds = await findProductIdsByTranslation(query, locale);

    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
          ...(translatedIds.length ? [{ id: { in: translatedIds } }] : []),
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        translations: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products.map((p) => localizeProduct(p, locale)));
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";

/**
 * Ids of products whose translated name/description for `locale` contains
 * `query` (case-insensitive). Lets Latvian shoppers search in Latvian while the
 * base columns stay English.
 */
export async function findProductIdsByTranslation(
  query: string,
  locale: string,
  limit = 500,
): Promise<string[]> {
  if (!query || !locale || locale === "en") return [];
  const pattern = `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Product"
     WHERE translations -> ${locale} ->> 'name' ILIKE ${pattern}
        OR translations -> ${locale} ->> 'description' ILIKE ${pattern}
     LIMIT ${limit}`;
  return rows.map((r) => r.id);
}

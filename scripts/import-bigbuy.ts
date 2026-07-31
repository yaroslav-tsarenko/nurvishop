import "dotenv/config";
import pg from "pg";

// Imports "Home and cooking" products from the BigBuy catalog API.
// Additive: never wipes existing data. Upserts by SKU.

const API_KEY = process.env.BIGBUY_API_PRODUCTION;
if (!API_KEY) throw new Error("BIGBUY_API_PRODUCTION not set in .env");

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set in .env");

const BASE = "https://api.bigbuy.eu";
const HOME_TAXONOMY = 19656; // "Home and cooking"
const TARGET_COUNT = 60; // how many products to import
const MAX_IMAGES = 5;

let client: pg.Client;

async function connect() {
  client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  client.on("error", () => {});
  await client.connect();
}

async function query(sql: string, params?: unknown[]) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await client.query(sql, params);
    } catch (err: any) {
      if (err.message?.includes("terminated") || err.message?.includes("Connection") || err.code === "EPIPE") {
        try { await client.end(); } catch {}
        await connect();
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed after 3 retries");
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").substring(0, 200);
}

function cuid(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|div|h\d)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function bb<T>(path: string): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    });
    if (res.status === 429) {
      await sleep(2000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
    return (await res.json()) as T;
  }
  throw new Error(`${path} rate-limited after retries`);
}

interface BBListItem {
  id: number;
  sku: string;
  ean13: string;
  weight: number;
  taxonomy: number;
  wholesalePrice: number;
  retailPrice: number;
  inShopsPrice: number;
  active: number;
  condition: string;
  intrastat: string | null;
  partNumber: string | null;
}
interface BBInfo { id: number; sku: string; name: string; description: string; url: string; }
interface BBImages { id: number; images: { url: string; isCover: boolean; position: number; logo: boolean; brand: number; whiteBackground: boolean }[] }
interface BBTaxonomy { id: number; name: string; parentTaxonomy: number }

async function main() {
  console.log("Fetching taxonomies...");
  const taxonomies = await bb<BBTaxonomy[]>("/rest/catalog/taxonomies.json?isoCode=en");
  const taxName = new Map(taxonomies.map((t) => [t.id, t.name]));

  console.log(`Fetching product list for taxonomy ${HOME_TAXONOMY} (Home and cooking)...`);
  const list = await bb<BBListItem[]>(`/rest/catalog/products.json?parentTaxonomy=${HOME_TAXONOMY}&isoCode=en`);
  console.log(`  ${list.length} products in category`);

  // Prefer NEW, active products with a valid EAN, in a mid-range price band so the
  // storefront shows appealing home/kitchen goods rather than cheap novelty items.
  const pool = list
    .filter(
      (p) =>
        p.active === 1 &&
        p.condition === "NEW" &&
        p.retailPrice >= 8 &&
        p.retailPrice <= 120 &&
        /^\d{13}$/.test(p.ean13),
    )
    .sort((a, b) => a.retailPrice - b.retailPrice);

  // Evenly sample across the price range for variety.
  const candidates: BBListItem[] = [];
  if (pool.length <= TARGET_COUNT) {
    candidates.push(...pool);
  } else {
    const stride = pool.length / TARGET_COUNT;
    for (let i = 0; i < TARGET_COUNT; i++) candidates.push(pool[Math.floor(i * stride)]);
  }

  console.log(`  Pool ${pool.length}, selected ${candidates.length} candidates`);

  await connect();
  const now = new Date().toISOString();

  // Root category for everything we import here.
  const rootSlug = "home-and-cooking";
  const rootRow = await query(
    `INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NULL, 0, true, $4, $4)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [cuid(), "Home & Cooking", rootSlug, now],
  );
  const rootId = rootRow.rows[0].id as string;

  const subCatCache = new Map<string, string>(); // slug -> id
  async function ensureSubCategory(name: string): Promise<string> {
    const slug = slugify(`home-${name}`);
    if (subCatCache.has(slug)) return subCatCache.get(slug)!;
    const row = await query(
      `INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 0, true, $5, $5)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "parentId" = EXCLUDED."parentId" RETURNING id`,
      [cuid(), name, slug, rootId, now],
    );
    const id = row.rows[0].id as string;
    subCatCache.set(slug, id);
    return id;
  }

  const usedSlugs = new Set<string>(
    (await query('SELECT slug FROM "Product"')).rows.map((r: { slug: string }) => r.slug),
  );
  function uniqueSlug(name: string, sku: string): string {
    let base = slugify(name) || slugify(sku) || "product";
    let slug = base;
    let i = 1;
    while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
    usedSlugs.add(slug);
    return slug;
  }

  let inserted = 0;
  let skipped = 0;

  for (let idx = 0; idx < candidates.length; idx++) {
    const p = candidates[idx];
    process.stdout.write(`\r  [${idx + 1}/${candidates.length}] ${p.sku}                      `);
    try {
      const info = (await bb<BBInfo[]>(`/rest/catalog/productinformation/${p.id}.json?isoCode=en`))[0];
      await sleep(120);
      if (!info?.name) { skipped++; continue; }

      const imagesRes = await bb<BBImages>(`/rest/catalog/productimages/${p.id}.json?isoCode=en`);
      await sleep(120);
      const imgs = (imagesRes.images || [])
        .filter((im) => !im.logo && im.brand === 0)
        .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0) || a.position - b.position)
        .slice(0, MAX_IMAGES);
      if (imgs.length === 0) { skipped++; continue; }

      const price = Math.round(p.retailPrice * 100) / 100;
      const comparePrice = p.inShopsPrice > price ? Math.round(p.inShopsPrice * 100) / 100 : null;
      const description = info.description ? stripHtml(info.description) : null;
      const shortDescription = description ? description.substring(0, 220).trim() : null;
      const condition = p.condition === "NEW" ? "new" : "refurbished";
      const subName = taxName.get(p.taxonomy) || "Home accessories";

      const productId = cuid();
      const res = await query(
        `INSERT INTO "Product" (id, name, slug, sku, price, "comparePrice", quantity, description, "shortDescription", brand, weight, status, ean, "isFeatured", condition, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'ACTIVE',$12,$13,$14,$15,$15)
         ON CONFLICT (sku) DO NOTHING RETURNING id`,
        [
          productId, info.name, uniqueSlug(info.name, p.sku), p.sku, price, comparePrice,
          25, description, shortDescription, null, p.weight || null, p.ean13,
          idx < 8, condition, now,
        ],
      );
      if (res.rows.length === 0) { skipped++; continue; } // already existed

      const catId = await ensureSubCategory(subName);
      await query(
        `INSERT INTO "ProductCategory" ("productId", "categoryId") VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [productId, catId],
      );

      const imgValues: unknown[] = [];
      const imgPlaceholders: string[] = [];
      imgs.forEach((im, j) => {
        imgPlaceholders.push(`($${j * 5 + 1}, $${j * 5 + 2}, $${j * 5 + 3}, $${j * 5 + 4}, $${j * 5 + 5})`);
        imgValues.push(cuid(), im.url, info.name, j, productId);
      });
      await query(
        `INSERT INTO "ProductImage" (id, url, alt, "sortOrder", "productId") VALUES ${imgPlaceholders.join(",")} ON CONFLICT DO NOTHING`,
        imgValues,
      );
      inserted++;
    } catch (err) {
      console.error(`\n  Failed ${p.sku}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n\nImport complete. Inserted ${inserted}, skipped ${skipped}.`);
  const counts = await Promise.all([
    query('SELECT count(*) FROM "Product"'),
    query('SELECT count(*) FROM "ProductImage"'),
  ]);
  console.log(`  Total products now: ${counts[0].rows[0].count}, images: ${counts[1].rows[0].count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});

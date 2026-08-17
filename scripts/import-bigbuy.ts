import "dotenv/config";
import pg from "pg";

/**
 * Full home-goods catalog rebuild from the BigBuy API.
 *
 * DESTRUCTIVE: wipes ALL existing Products, images, category links, variants,
 * reviews and wishlist items, plus the old Category tree, then imports a fresh
 * ~2000-product home & cooking catalog. Order history survives — OrderItem keeps
 * its denormalised productName/productSku and its productId is nulled (FK SetNull).
 *
 * Products are spread across BigBuy's 20 top-level "Home and cooking" categories
 * proportionally to availability, and within each category across its leaf
 * subcategories, so the storefront sidebar shows well-populated, varied counts.
 *
 * Run:  npx tsx scripts/import-bigbuy.ts
 */

const API_KEY = process.env.BIGBUY_API_PRODUCTION;
if (!API_KEY) throw new Error("BIGBUY_API_PRODUCTION not set in .env");

const connectionString = process.env.DIRECT_URL;
if (!connectionString) throw new Error("DIRECT_URL not set in .env");

const BASE = "https://api.bigbuy.eu";
const HOME_TAXONOMY = 19656; // "Home and cooking"
const TARGET_NET = 2000; // products to end up with
const CANDIDATE_BUFFER = 1.35; // over-select to absorb image-less/nameless drops
const PRICE_MIN = 5;
const PRICE_MAX = 200;
const MAX_IMAGES = 5;
const FEATURED_COUNT = 12;

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
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    });
    if (res.status === 429) {
      await sleep(3000 * (attempt + 1));
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
}
interface BBInfo { id: number; sku: string; name: string; description: string; url: string; }
interface BBImageEntry { url: string; isCover: boolean; position: number; logo: boolean }
interface BBImages { id: number; images: BBImageEntry[] }
interface BBTaxonomy { id: number; name: string; parentTaxonomy: number }

/**
 * Download one of BigBuy's whole-catalog bulk endpoints (~300MB each), parse it,
 * and keep only the rows whose id is in `keep`. This replaces ~5000 throttled
 * per-product calls with a single request, turning a 3-hour run into minutes.
 */
async function bulkFiltered<T extends { id: number }>(path: string, keep: Set<number>): Promise<Map<number, T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  const all = (await res.json()) as T[];
  const map = new Map<number, T>();
  for (const row of all) {
    if (keep.has(row.id)) map.set(row.id, row);
  }
  all.length = 0; // release the big array for GC
  return map;
}

async function main() {
  // ── 1. Fetch taxonomy tree ──────────────────────────────────
  console.log("Fetching taxonomies...");
  const taxonomies = await bb<BBTaxonomy[]>("/rest/catalog/taxonomies.json?isoCode=en");
  const byId = new Map(taxonomies.map((t) => [t.id, t]));
  const taxName = (id: number) => byId.get(id)?.name?.trim() || "Home accessories";

  // The direct child of HOME that a leaf taxonomy descends from (its level-1 group).
  function level1Ancestor(taxId: number): number {
    let cur = byId.get(taxId);
    let prev = taxId;
    let guard = 0;
    while (cur && cur.parentTaxonomy && cur.id !== HOME_TAXONOMY && guard++ < 12) {
      prev = cur.id;
      cur = byId.get(cur.parentTaxonomy);
    }
    return prev;
  }

  // ── 2. Fetch + filter product pool ──────────────────────────
  console.log(`Fetching product list under Home (${HOME_TAXONOMY})...`);
  const list = await bb<BBListItem[]>(`/rest/catalog/products.json?parentTaxonomy=${HOME_TAXONOMY}&isoCode=en`);
  console.log(`  ${list.length} products in subtree`);

  const pool = list.filter(
    (p) =>
      p.active === 1 &&
      p.condition === "NEW" &&
      p.retailPrice >= PRICE_MIN &&
      p.retailPrice <= PRICE_MAX &&
      /^\d{13}$/.test(p.ean13 || ""),
  );
  console.log(`  ${pool.length} qualify (active/NEW/EAN/price ${PRICE_MIN}-${PRICE_MAX})`);

  // ── 3. Balanced selection ───────────────────────────────────
  // Group pool by level-1 category, then within each by leaf taxonomy.
  const byLevel1 = new Map<number, Map<number, BBListItem[]>>();
  for (const p of pool) {
    const l1 = level1Ancestor(p.taxonomy);
    if (!byLevel1.has(l1)) byLevel1.set(l1, new Map());
    const leaves = byLevel1.get(l1)!;
    if (!leaves.has(p.taxonomy)) leaves.set(p.taxonomy, []);
    leaves.get(p.taxonomy)!.push(p);
  }

  const totalAvail = pool.length;
  const budget = Math.round(TARGET_NET * CANDIDATE_BUFFER);

  // Proportional allocation per level-1 category, with a small floor so tiny
  // categories still appear, capped at what's actually available.
  const perCat: { l1: number; picks: BBListItem[] }[] = [];
  for (const [l1, leaves] of byLevel1) {
    const avail = [...leaves.values()].reduce((s, arr) => s + arr.length, 0);
    let alloc = Math.round(budget * (avail / totalAvail));
    alloc = Math.max(Math.min(avail, 8), alloc);
    alloc = Math.min(alloc, avail);

    // Round-robin across this category's leaves for within-category spread.
    const leafArrs = [...leaves.values()].map((arr) =>
      [...arr].sort((a, b) => a.retailPrice - b.retailPrice),
    );
    const picks: BBListItem[] = [];
    let i = 0;
    while (picks.length < alloc) {
      let progressed = false;
      for (const arr of leafArrs) {
        if (arr[i]) {
          picks.push(arr[i]);
          progressed = true;
          if (picks.length >= alloc) break;
        }
      }
      if (!progressed) break;
      i++;
    }
    perCat.push({ l1, picks });
  }

  // Weighted global round-robin across categories so an early stop stays balanced.
  const candidates: BBListItem[] = [];
  const cursors = perCat.map(() => 0);
  let remaining = perCat.reduce((s, c) => s + c.picks.length, 0);
  while (candidates.length < budget && remaining > 0) {
    remaining = 0;
    for (let c = 0; c < perCat.length; c++) {
      const { picks } = perCat[c];
      if (cursors[c] < picks.length) {
        candidates.push(picks[cursors[c]]);
        cursors[c]++;
        if (candidates.length >= budget) break;
      }
      remaining += picks.length - cursors[c];
    }
  }
  console.log(`  Selected ${candidates.length} candidates across ${byLevel1.size} categories (net target ${TARGET_NET})`);

  // ── 3b. Bulk-fetch names + images for the selected ids only ─
  const keep = new Set<number>(candidates.map((c) => c.id));
  console.log("\nDownloading bulk product info (~330MB)...");
  const infoMap = await bulkFiltered<BBInfo>("/rest/catalog/productsinformation.json?isoCode=en", keep);
  console.log(`  matched info for ${infoMap.size} products`);
  console.log("Downloading bulk product images (~290MB)...");
  const imgMap = await bulkFiltered<BBImages>("/rest/catalog/productsimages.json", keep);
  console.log(`  matched images for ${imgMap.size} products`);

  // ── 4. Wipe old catalog ─────────────────────────────────────
  await connect();
  console.log("\nWiping old catalog (products cascade to images/links/variants/reviews/wishlist; order history preserved)...");
  await query("BEGIN");
  await query('DELETE FROM "Product"');
  await query('DELETE FROM "Category"');
  await query("COMMIT");
  console.log("  Old catalog cleared.");

  // ── 5. Category tree scaffolding ────────────────────────────
  const now = new Date().toISOString();
  const rootRow = await query(
    `INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, NULL, 0, true, $4, $4)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    [cuid(), "Home & Cooking", "home-and-cooking", now],
  );
  const rootId = rootRow.rows[0].id as string;

  const catCache = new Map<number, string>(); // taxonomy id -> Category id
  async function ensureCategory(taxId: number, parentId: string): Promise<string> {
    if (catCache.has(taxId)) return catCache.get(taxId)!;
    const name = taxName(taxId);
    const slug = slugify(`${name}-${taxId}`);
    const row = await query(
      `INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 0, true, $5, $5)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "parentId" = EXCLUDED."parentId" RETURNING id`,
      [cuid(), name, slug, parentId, now],
    );
    const id = row.rows[0].id as string;
    catCache.set(taxId, id);
    return id;
  }

  // ── 6. Import loop ──────────────────────────────────────────
  const usedSlugs = new Set<string>();
  function uniqueSlug(name: string, sku: string): string {
    const base = slugify(name) || slugify(sku) || "product";
    let slug = base;
    let i = 1;
    while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
    usedSlugs.add(slug);
    return slug;
  }

  let inserted = 0;
  let skipped = 0;

  for (let idx = 0; idx < candidates.length && inserted < TARGET_NET; idx++) {
    const p = candidates[idx];
    if (idx % 50 === 0) process.stdout.write(`\r  [${idx + 1}/${candidates.length}] inserted ${inserted}            `);
    try {
      const info = infoMap.get(p.id);
      if (!info?.name) { skipped++; continue; }

      const imgs = (imgMap.get(p.id)?.images || [])
        .filter((im) => !im.logo)
        .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0) || a.position - b.position)
        .slice(0, MAX_IMAGES);
      if (imgs.length === 0) { skipped++; continue; }

      const price = Math.round(p.retailPrice * 100) / 100;
      const comparePrice = p.inShopsPrice > price ? Math.round(p.inShopsPrice * 100) / 100 : null;
      const description = info.description ? stripHtml(info.description) : null;
      const shortDescription = description ? description.substring(0, 220).trim() : null;

      // Category tree: root -> level-1 -> leaf (collapse deeper nesting to 3 levels).
      const l1Tax = level1Ancestor(p.taxonomy);
      const l1CatId = await ensureCategory(l1Tax, rootId);
      const leafCatId = p.taxonomy === l1Tax ? l1CatId : await ensureCategory(p.taxonomy, l1CatId);

      const productId = cuid();
      const res = await query(
        `INSERT INTO "Product" (id, name, slug, sku, price, "comparePrice", quantity, description, "shortDescription", brand, weight, status, ean, "isFeatured", condition, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'ACTIVE',$12,$13,'new',$14,$14)
         ON CONFLICT (sku) DO NOTHING RETURNING id`,
        [
          productId, info.name, uniqueSlug(info.name, p.sku), p.sku, price, comparePrice,
          25, description, shortDescription, null, p.weight || null, p.ean13,
          inserted < FEATURED_COUNT, now,
        ],
      );
      if (res.rows.length === 0) { skipped++; continue; }

      await query(
        `INSERT INTO "ProductCategory" ("productId", "categoryId") VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [productId, leafCatId],
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

  // ── 7. Report ───────────────────────────────────────────────
  console.log(`\n\nImport complete. Inserted ${inserted}, skipped ${skipped}.`);
  const counts = await Promise.all([
    query('SELECT count(*) FROM "Product"'),
    query('SELECT count(*) FROM "ProductImage"'),
    query('SELECT count(*) FROM "Category"'),
  ]);
  console.log(
    `  Products: ${counts[0].rows[0].count}, images: ${counts[1].rows[0].count}, categories: ${counts[2].rows[0].count}`,
  );

  await client.end();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
